const UserModel = require("../models/user");
const AccountModel = require("../models/account");
const AddressModel = require("../models/address");
const { json } = require("express");
const ObjectId = require("mongoose").Types.ObjectId;
class UserService {
  static addUser = async (payload) => {
    const newUser = new UserModel(payload);
    await newUser.save();
    return newUser;
  };

  static addAccount = async (payload) => {
    const newAccount = new AccountModel(payload);
    await newAccount.save();
    return newAccount;
  };

  static addCodeActive = async (user_id, code, type, exp_seconds = 60) => {
    const USER_ID = new ObjectId(user_id);
    await AccountModel.findOneAndUpdate(
      {
        USER_ID: USER_ID,
      },
      {
        $push: {
          LIST_CODE_ACTIVE: {
            CODE: code,
            IS_USING: false,
            CREATED_AT: new Date(),
            TIME_USING: null,
            EXP_DATE: new Date(new Date().getTime() + exp_seconds * 1000),
            TYPE: type,
          },
        },
      }
    );
  };
  static getCodeByUserId = async (user_id, type) => {
    const USER_ID = new ObjectId(user_id);
    const Account = await AccountModel.aggregate([
      {
        $match: {
          USER_ID: USER_ID,
          LIST_CODE_ACTIVE: {
            $elemMatch: {
              TYPE: type,
            },
          },
        },
      },
      {
        $unwind: "$LIST_CODE_ACTIVE",
      },
      {
        $sort: {
          "LIST_CODE_ACTIVE.CREATED_AT": -1,
        },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          CODE: "$LIST_CODE_ACTIVE.CODE",
          EXP_DATE: "$LIST_CODE_ACTIVE.EXP_DATE",
          _id: 0,
        },
      },
    ]);
    return Account;
  };
  static getCodeByEmail = async (email, type) => {
    const Account = await UserModel.aggregate([
      {
        $match: {
          EMAIL_USER: email,
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "_id",
          foreignField: "USER_ID",
          as: "userAccount",
          pipeline: [
            {
              $match: {
                LIST_CODE_ACTIVE: {
                  $elemMatch: {
                    TYPE: type,
                  },
                },
              },
            },
            {
              $unwind: "$LIST_CODE_ACTIVE",
            },
            {
              $sort: {
                "LIST_CODE_ACTIVE.CREATED_AT": -1,
              },
            },
            {
              $project: {
                ID_CODE: "$LIST_CODE_ACTIVE._id",
                CODE: "$LIST_CODE_ACTIVE.CODE",
                EXP_DATE: "$LIST_CODE_ACTIVE.EXP_DATE",
                CREATED_AT: "$LIST_CODE_ACTIVE.CREATED_AT",
                _id: 0,
              },
            },
          ],
        },
      },
      {
        $sort: {
          "userAccount[0].CREATED_AT": -1,
        },
      },
      {
        $unwind: {
          path: "$userAccount",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$$ROOT", "$userAccount"],
          },
        },
      },
      {
        $project: {
          _id: 1,
          ID_CODE: 1,
          CODE: 1,
          EXP_DATE: 1,
          CREATED_AT: 1,
        },
      },
    ]);
    return Account[0];
  };
  static activeAccountById = async (account_id) => {
    const ACCOUNT_ID = new ObjectId(account_id);
    await AccountModel.findOneAndUpdate(
      {
        _id: ACCOUNT_ID,
      },
      {
        $set: {
          IS_ACTIVE: true,
        },
      }
    );
  };
  static updateListCodeById = async (accounts_id, id_list_code_active) => {
    const ID_LIST_CODE_ACTIVE = new ObjectId(id_list_code_active);
    const ACCOUNT_ID = new ObjectId(accounts_id);
    const active = await AccountModel.updateOne(
      {
        _id: ACCOUNT_ID,
        LIST_CODE_ACTIVE: {
          $elemMatch: {
            _id: ID_LIST_CODE_ACTIVE,
          },
        },
      },
      {
        $set: {
          "LIST_CODE_ACTIVE.$.IS_USING": true,
          "LIST_CODE_ACTIVE.$.TIME_USING": new Date(),
        },
      }
    );
    return active;
  };
  static checkActiveByEmail = async (email) => {
    const checkActive = UserModel.aggregate([
      {
        $match: {
          EMAIL_USER: email,
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "_id",
          foreignField: "USER_ID",
          as: "userAccount",
          pipeline: [
            {
              $project: {
                IS_ACTIVE: 1,
                _id: 0,
                ACCOUNT_ID: "$_id",
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$userAccount",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$$ROOT", "$userAccount"],
          },
        },
      },
      {
        $project: {
          _id: 1,
          IS_ACTIVE: 1,
          ACCOUNT_ID: 1,
        },
      },
    ]);
    return checkActive;
  };
  static checkActiveById = async (account_id) => {
    const ACCOUNT_ID = new ObjectId(account_id);
    const checkActive = AccountModel.aggregate([
      {
        $match: {
          _id: ACCOUNT_ID,
        },
      },
      {
        $unwind: {
          path: "$LIST_CODE_ACTIVE",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$$ROOT", "$LIST_CODE_ACTIVE"],
          },
        },
      },
      {
        $project: {
          _id: 1,
          IS_ACTIVE: 1,
        },
      },
    ]);
    return checkActive;
  };
  static getLoginUser = async (id_account) => {
    const ID_ACCOUNT = new ObjectId(id_account);
    const user = await AccountModel.findById(ID_ACCOUNT).populate("USER_ID");
    return user;
  };
  static getNumberPhoneUser = async (id_account) => {
    const ID_ACCOUNT = new ObjectId(id_account);
    const user = await AccountModel.aggregate([
      {
        $match: {
          _id: ID_ACCOUNT,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "USER_ID",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
        },
      },
      {
        $project: {
          OBJECT_ROLE: 0,
          LIST_CODE_ACTIVE: 0,
        },
      },
    ]);
    return user[0].user.PHONE_NUMBER;
  };
}

module.exports = UserService;
