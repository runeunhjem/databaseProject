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
      start_date: { type: DataTypes.DATE, allowNull: false },
      end_date: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      modelName: "Reservation",
      timestamps: false,
      hasTrigger: true, // ✅ Let Sequelize know there's a trigger in MySQL
    }
  );

  return Reservation;
};

