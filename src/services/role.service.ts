import { db } from "../config/db";

interface createRole {
  user_id: string;
  role_id: number;
  sub_role_id: number;
}
const connection = db();

export const assignRole = async (data: createRole) => {
  try {
    const sql = `
        INSERT INTO user_role (user_id,role_id, sub_role_id)
        VALUES (?,?,?)
      `;

    const [result]: any = (await connection).execute(sql, [
      data.user_id,
      data.role_id,
      data.sub_role_id,
    ]);

    // Check if user was created successfully (affected rows should be 1)
    if (result.affectedRows === 1) {
      return { status: true, message: "User role assigned" }; // Or return relevant user data
    } else {
      return { status: false, message: "Failed to assign role" };
    }
  } catch (error) {
    return error;
  }
};
