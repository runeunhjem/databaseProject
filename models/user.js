"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Reservation, { foreignKey: "user_id", onDelete: "CASCADE" });
      User.hasMany(models.Rating, { foreignKey: "user_id", onDelete: "CASCADE" });
    }

    // ✅ Method to hash password
    static hashPassword(password) {
      const salt = bcrypt.genSaltSync(10);
      return bcrypt.hashSync(password, salt);
    }

    // ✅ Method to validate password
    validatePassword(password) {
      return bcrypt.compareSync(password, this.password);
    }
  }

  User.init(
    {
      username: { type: DataTypes.STRING, allowNull: false, unique: true },
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false }, // ✅ FIXED HERE
      role: { type: DataTypes.STRING, allowNull: false, ***REMOVED***Value: "User" },
    },
    {
      sequelize,
      modelName: "User",
      timestamps: false,
    }
  );

  return User;
};

