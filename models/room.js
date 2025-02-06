"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      Room.belongsTo(models.Hotel, { foreignKey: "hotel_id", onDelete: "CASCADE" });
      Room.hasMany(models.Reservation, { foreignKey: "room_id", onDelete: "CASCADE" });
    }
  }

  Room.init(
    {
      hotel_id: { type: DataTypes.INTEGER, allowNull: false },
      capacity: { type: DataTypes.INTEGER, allowNull: false },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    {
      sequelize,
      modelName: "Room",
      timestamps: false,
    }
  );

  return Room;
};

