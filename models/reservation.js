"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Reservation extends Model {
    static associate(models) {
      Reservation.belongsTo(models.User, { foreignKey: "user_id", onDelete: "CASCADE" });
      Reservation.belongsTo(models.Room, { foreignKey: "room_id", onDelete: "CASCADE" });
    }
  }

  Reservation.init(
    {
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      room_id: { type: DataTypes.INTEGER, allowNull: false },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Start date is required" },
          isDate: { msg: "Start date must be a valid date" },
          isFuture(value) {
            if (new Date(value) <= new Date()) {
              throw new Error("Start date must be in the future");
            }
          },
        },
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: { msg: "End date is required" },
          isDate: { msg: "End date must be a valid date" },
          isFuture(value) {
            if (new Date(value) <= new Date()) {
              throw new Error("End date must be in the future");
            }
          },
          isAfterStart(value) {
            if (this.start_date && new Date(value) <= new Date(this.start_date)) {
              throw new Error("End date must be at least one day after the start date");
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Reservation",
      timestamps: false,
      hasTrigger: true,
    }
  );

  return Reservation;
};

