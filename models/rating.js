"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    static associate(models) {
      Rating.belongsTo(models.User, { foreignKey: "user_id", onDelete: "CASCADE" });
      Rating.belongsTo(models.Hotel, { foreignKey: "hotel_id", onDelete: "CASCADE" });
    }
  }

  Rating.init(
    {
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      hotel_id: { type: DataTypes.INTEGER, allowNull: false },
      rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    },
    {
      sequelize,
      modelName: "Rating",
      timestamps: false,
    }
  );

  return Rating;
};

