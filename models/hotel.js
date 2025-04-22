"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Hotel extends Model {
    static associate(models) {
      Hotel.hasMany(models.Room, { foreignKey: "hotel_id", onDelete: "CASCADE" });
      Hotel.hasMany(models.Rating, { foreignKey: "hotel_id", onDelete: "CASCADE" });
    }
  }

  Hotel.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      location: { type: DataTypes.STRING, allowNull: false },
      avg_rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
    },
    {
      sequelize,
      modelName: "Hotel",
      timestamps: false,
    }
  );

  return Hotel;
};

