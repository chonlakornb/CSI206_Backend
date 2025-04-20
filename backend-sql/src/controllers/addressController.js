import { pool } from '../config/db.js';

export const addAddress = async (req, res) => {
  const { street_address, province, postal_code, country } = req.body;

  try {
    // Use req.user.id to get the authenticated user's ID
    const user_id = req.user.id;

    // Update the query to match the actual column names in the table
    const [result] = await pool.query(
      'INSERT INTO address (user_id, street_address, province, postal_code, country) VALUES (?, ?, ?, ?, ?)',
      [user_id, street_address, province, postal_code, country]
    );

    res.status(201).json({
      message: 'Address added successfully',
      address: {
        id: result.insertId,
        user_id,
        street_address,
        province,
        postal_code,
        country,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAddressById = async (req, res) => {
  const { id } = req.params; // Address ID
  const { street_address, province, postal_code, country } = req.body;

  try {
    // Use req.user.id to ensure the address belongs to the authenticated user
    const user_id = req.user.id;

    // Check if the address exists and belongs to the user
    const [address] = await pool.query(
      'SELECT * FROM address WHERE address_id = ? AND user_id = ?',
      [id, user_id]
    );

    if (address.length === 0) {
      return res.status(404).json({ message: 'Address not found or does not belong to the user' });
    }

    // Update the address
    await pool.query(
      'UPDATE address SET street_address = ?, province = ?, postal_code = ?, country = ? WHERE address_id = ? AND user_id = ?',
      [street_address || address[0].street_address, province || address[0].province, postal_code || address[0].postal_code, country || address[0].country, id, user_id]
    );

    res.json({ message: 'Address updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAddresses = async (req, res) => {
  try {
    const user_id = req.user.id;
    const user_role = req.user.role;

    let query = '';
    let params = [];

    // Admin can view all addresses
    if (user_role === 'admin') {
      query = `
        SELECT a.address_id, a.user_id, u.name AS user_name, a.street_address, a.province, a.postal_code, a.country 
        FROM address a 
        JOIN users u ON a.user_id = u.user_id
      `;
    } 
    // Users and sellers can view only their own addresses
    else {
      query = `
        SELECT a.address_id, a.user_id, a.street_address, a.province, a.postal_code, a.country 
        FROM address a 
        WHERE a.user_id = ?
      `;
      params = [user_id];
    }

    // Execute the query
    const [addresses] = await pool.query(query, params);

    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
