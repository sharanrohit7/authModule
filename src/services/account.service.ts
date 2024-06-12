import { RowDataPacket } from "mysql2";
import {db} from "../config/db"
import bcrypt from "bcrypt"
import { signToken } from "./token.service";
interface createUser{
    id: string,
    email?: string,
    password: string,
    phone?: string,
    role_id : string,
    sub_role_id: string
}
const connection = db();

export const createAccountEmail = async (data: createUser) => {
  let conn;
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const roleId = Number(data.role_id);
    const subRoleId = Number(data.sub_role_id);

    const userSql = `
      INSERT INTO users (id, email, password, phone)
      VALUES (?, ?, ?, ?);
    `;

    const userRoleSql = `
      INSERT INTO user_role (user_id, role_id, sub_role_id)
      VALUES (?, ?, ?);
    `;

    conn = await (await connection).getConnection();

    // Start transaction
    await conn.beginTransaction();

    // Insert user into the users table
    const [userResult]: any = await conn.execute(userSql, [data.id, data.email, hashedPassword, data.phone]);

    // Check if user was created successfully (affected rows should be 1)
    if (userResult.affectedRows !== 1) {
      throw new Error('Failed to create user');
    }

    // Insert role information into the user_role table
    const [userRoleResult]: any = await conn.execute(userRoleSql, [data.id, roleId, subRoleId]);

    // Check if role was assigned successfully (affected rows should be 1)
    if (userRoleResult.affectedRows !== 1) {
      throw new Error('Failed to assign role');
    }

    // Commit transaction
    await conn.commit();

    // Fetch the newly inserted user and their role information
    const fetchUserSql = `
      SELECT u.id, u.email, u.phone, ur.role_id, ur.sub_role_id
      FROM users u
      JOIN user_role ur ON u.id = ur.user_id
      WHERE u.id = ?;
    `;
    const [rows]: [RowDataPacket[], any] = await conn.execute(fetchUserSql, [data.id]);

    if (rows.length === 0) {
      throw new Error('Failed to fetch user data');
    }

    const userData = rows[0];

    console.log('User created and role assigned successfully!');
    return { 
      message: 'User created and role assigned successfully',
      user: userData
    };

  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return { error: "Account already exists" };
    }

    // Rollback transaction in case of error
    if (conn) {
      await conn.rollback();
    }

    console.error('Error creating user:', error);
    return { error: error.message };

  } finally {
    if (conn) {
      await conn.release();
    }
  }
};



export const createAccountPhone = async (data: createUser) => {
  let conn;
  try {
    if (!data.id || !data.password || !data.phone || !data.role_id || !data.sub_role_id) {
      throw new Error("Missing required fields");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const roleId = Number(data.role_id);
    const subRoleId = Number(data.sub_role_id);

    console.log("Data is:", data);
    console.log("Role ID and Sub Role ID are:", roleId, subRoleId);
    console.log("Hashed password:", hashedPassword);

    const userSql = `
      INSERT INTO users (id, password, phone)
      VALUES (?, ?, ?);
    `;

    const userRoleSql = `
      INSERT INTO user_role (user_id, role_id, sub_role_id)
      VALUES (?, ?, ?);
    `;

    conn = await (await connection).getConnection();

    // Start transaction
    await conn.beginTransaction();

    // Insert user into the users table
    const [userResult]: any = await conn.execute(userSql, [data.id, hashedPassword, data.phone]);

    // Check if user was created successfully (affected rows should be 1)
    if (userResult.affectedRows !== 1) {
      throw new Error('Failed to create user');
    }

    // Insert role information into the user_role table
    const [userRoleResult]: any = await conn.execute(userRoleSql, [data.id, roleId, subRoleId]);

    // Check if role was assigned successfully (affected rows should be 1)
    if (userRoleResult.affectedRows !== 1) {
      throw new Error('Failed to assign role');
    }

    // Commit transaction
    await conn.commit();

    console.log('User created and role assigned successfully!');
    return { message: 'User created and role assigned successfully' };

  } catch (error: any) {
    if (conn) {
      await conn.rollback();
    }
    console.error('Error creating user:', error);
    return { error: error.message };

  } finally {
    if (conn) {
      await conn.release();
    }
  }
};
interface UpdateUser {
  id: string;
  email?: string;
  password?: string;
  phone?: string;
  role_id?: number;
  sub_role_id?: number;
}



export const updateAccount = async (data: UpdateUser) => {
  try {
    const conn = await connection;

    // Prepare parts of the SQL update query
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (data.email && data.email.trim() !== "") {
      updates.push("email = ?");
      values.push(data.email);
    }
    if (data.password && data.password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      updates.push("password = ?");
      values.push(hashedPassword);
    }
    if (data.phone && data.phone.trim() !== "") {
      updates.push("phone = ?");
      values.push(data.phone);
    }

    // If there are no fields to update, return early
    if (updates.length === 0) {
      return { message: "No valid fields to update" };
    }

    // Add the user ID to the values array for the WHERE clause
    values.push(data.id);

    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

    // Start transaction
    await conn.beginTransaction();

    // Execute the update query
    const [result]: any = await conn.execute(sql, values);

    // Check if user was updated successfully
    if (result.affectedRows !== 1) {
      throw new Error('Failed to update user');
    }

    // Update role information if provided
    if (data.role_id || data.sub_role_id) {
      const roleUpdates: string[] = [];
      const roleValues: (number | string)[] = [];

      if (data.role_id) {
        roleUpdates.push("role_id = ?");
        roleValues.push(data.role_id);
      }
      if (data.sub_role_id) {
        roleUpdates.push("sub_role_id = ?");
        roleValues.push(data.sub_role_id);
      }

      if (roleUpdates.length > 0) {
        roleValues.push(data.id);

        const roleSql = `UPDATE user_role SET ${roleUpdates.join(", ")} WHERE user_id = ?`;

        const [roleResult]: any = await conn.execute(roleSql, roleValues);

        // Check if role was updated successfully
        if (roleResult.affectedRows !== 1) {
          throw new Error('Failed to update user role');
        }
      }
    }

    // Commit transaction
    await conn.commit();

    console.log('User updated successfully!');
    return { message: 'User updated successfully' };

  } catch (error: any) {
    // Rollback transaction in case of error
    const conn = await connection;
    await conn.rollback();

    console.error('Error updating user:', error);
    return { error: error.message };
  }
};

interface loginMobile {
  phone: string,
  password: string
}

export const loginPhone = async (data: loginMobile) => {
  let conn;
  try {
    const { phone, password } = data;
    conn = await (await connection).getConnection();

    // Query to find the user by phone
    const userSql = `
    SELECT u.id, u.phone, u.password, ur.role_id, ur.sub_role_id, GROUP_CONCAT(m.module_name) AS modules
    FROM users u
    JOIN user_role ur ON u.id = ur.user_id
    LEFT JOIN role_module rm ON rm.sub_role_id = ur.sub_role_id
    LEFT JOIN modules m ON m.id = rm.module_id
    WHERE u.phone = ?
    GROUP BY u.id, ur.role_id, ur.sub_role_id;;
    `;
    const [rows]: [RowDataPacket[], any] = await conn.execute(userSql, [phone]);

    // Check if the user exists
    if (rows.length === 0) {
      return { error: "Invalid phone or password" };
    }

    const user = rows[0];

    // Compare the provided password with the hashed password in the database
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return { error: "Invalid phone or password" };
    }

    const token = await signToken(user.id,user.role_id)
    if(token.error){
      return {error: "Token issue"}
    }
    if (token){
      return { 
        message: 'User logged in successfully', 
        user: {
          id: user.id,
          role_id: user.role_id,
          sub_role_id: user.sub_role_id
        },
        modules: user.modules ? user.modules.split(',') : [],
        token: token
      };
    }
   

  } catch (error: any) {
    console.error('Error logging in user:', error);
    return { error: error.message };

  } finally {
    if (conn) {
      await conn.release();
    }
  }
};

interface loginEmail {
  email: string,
  password: string
}

// export const loginEmail = async (data: loginEmail) => {
//   let conn;
//   try {
//     const { email, password } = data;
//     conn = await (await connection).getConnection();

//     // Query to find the user by phone
//     const userSql = `
//       SELECT u.id, u.email, u.password, ur.role_id, ur.sub_role_id, m.module_name
//       FROM users u
//       JOIN user_role ur ON u.id = ur.user_id
//       LEFT JOIN role_module rm ON rm.sub_role_id = ur.sub_role_id
//       LEFT JOIN modules m ON m.id = rm.module_id
//       WHERE u.email = ?;
//     `;
//     const [rows]: [RowDataPacket[], any] = await conn.execute(userSql, [email]);

//     // Check if the user exists
//     if (rows.length === 0) {
//       return { error: "Invalid email or password" };
//     }

//     const user = rows[0];

//     // Compare the provided password with the hashed password in the database
//     const isPasswordMatch = await bcrypt.compare(password, user.password);
//     if (!isPasswordMatch) {
//       return { error: "Invalid phone or password" };
//     }
// console.log("Modules   :",user.module_name);

//     const token = await signToken(user.id,user.role_id)
//     if (token){
//       return { 
//         message: 'User logged in successfully', 
//         user: {
//           id: user.id,
//           role_id: user.role_id,
//           sub_role_id: user.sub_role_id
//         },
//         modules: user.module_name,
//         token: token
//       };
//     }
   

//   } catch (error: any) {
//     console.error('Error logging in user:', error);
//     return { error: error.message };

//   } finally {
//     if (conn) {
//       await conn.release();
//     }
//   }
// };

export const loginEmail = async (data: loginEmail) => {
  let conn;
  try {
    const { email, password } = data;
    conn = await (await connection).getConnection();

    // Query to find the user by email and aggregate module names
    const userSql = `
      SELECT u.id, u.email, u.password, ur.role_id, ur.sub_role_id, GROUP_CONCAT(m.module_name) AS modules
      FROM users u
      JOIN user_role ur ON u.id = ur.user_id
      LEFT JOIN role_module rm ON rm.sub_role_id = ur.sub_role_id
      LEFT JOIN modules m ON m.id = rm.module_id
      WHERE u.email = ?
      GROUP BY u.id, ur.role_id, ur.sub_role_id;
    `;
    const [rows]: [RowDataPacket[], any] = await conn.execute(userSql, [email]);

    // Check if the user exists
    if (rows.length === 0) {
      return { error: "Invalid email or password" };
    }

    const user = rows[0];

    // Compare the provided password with the hashed password in the database
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return { error: "Invalid email or password" };
    }

    // Generate a JWT token for the authenticated user
    const token = await signToken(user.id, user.role_id);
    if (token) {
      return { 
        message: 'User logged in successfully', 
        user: {
          id: user.id,
          role_id: user.role_id,
          sub_role_id: user.sub_role_id
        },
        modules: user.modules ? user.modules.split(',') : [],
        token: token
      };
    }

  } catch (error: any) {
    console.error('Error logging in user:', error);
    return { error: error.message };

  } finally {
    if (conn) {
      await conn.release();
    }
  }
};