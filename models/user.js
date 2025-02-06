"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Reservation, { foreignKey: "user_id", onDelete: "CASCADE" });
      User.hasMany(models.Rating, { foreignKey: "user_id", onDelete: "CASCADE" });
    }
  }

  User.init(
    {
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "User",
      timestamps: false, // Disable createdAt/updatedAt columns if not needed
    }
  );

  return User;
};

