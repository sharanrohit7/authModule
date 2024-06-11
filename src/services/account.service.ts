import {db} from "../config/db"
import bcrypt from "bcrypt"
interface createUser{
    id: string,
    email: string,
    password: string,
    phone: string
}
const connection = db();
export const createAccount = async (data: createUser) => {
    try {
      
  
      const hashedPassword = await bcrypt.hash(data.password, 10);
  
      const sql = `
        INSERT INTO users (id,email, password, phone)
        VALUES (?,?, ?, ?)
      `;
  
      const [result]: any =  (await connection).execute(sql, [data.id,data.email, hashedPassword, data.phone]);
  
      // Check if user was created successfully (affected rows should be 1)
      if (result.affectedRows === 1) {
        console.log('User created successfully!');
        return { message: 'User created successfully' }; // Or return relevant user data
      } else {
        throw new Error('Failed to create user');
      }
    } catch (error: any) {
        if(error.code === 'ER_DUP_ENTRY') return "Account already exists"
      console.error('Error creating user:', error);
      return { error: error.message };
    }
  };

