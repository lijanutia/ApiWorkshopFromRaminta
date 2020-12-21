import { clientName } from '../tests/createNewClient.spec';
require('dotenv-flow').config();
const axios = require('axios').default;
const { QueryTypes } = require('sequelize');
const { Sequelize, Model, DataTypes } = require('sequelize');

before(async () => {
  await userAuth();
});
after(async () => {
  console.log('after Hook');
  const clientID = await queryCreatedClient(clientName);
  console.log(clientID.id);
});
export async function userAuth() {
  const url = process.env.ENVIRONEMENT;
  const username = process.env.USERNAME_ADMIN;
  const password = process.env.USER_PASSWORD;

  //Axios needs the auth to be "encrypted" with both username and password
  const usernamePasswordBuffer = Buffer.from(username + ':' + password);
  const base64data = usernamePasswordBuffer.toString('base64');
  const axiosBasicAuth = axios.create({
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${base64data}`,
    },
  });

  await axiosBasicAuth.get(url);

  //setting base url and headers for other requests
  axios.defaults.baseURL = process.env.ENVIRONEMENT;
  axios.defaults.headers = {
    Authorization: `Basic ${base64data}`,
    'X-Authorization': 'userId=1&role=admins',
  };
}

export async function queryCreatedClient(organizationName) {
  const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER_NAME,
    process.env.DATABASE_USER_PASS,
    {
      host: process.env.DATABASE_HOST,
      dialect: 'mssql',
      dialectOptions: {
        options: {
          validateBulkLoadParameters: true,
        },
      },
    },
  );
  const clientId = await sequelize.query(
    `select id from client where organization='${organizationName}'`,
    {
      plain: true,
      type: QueryTypes.SELECT,
    },
  );

  /*ARCHIVING CLIENT*/
  await sequelize.query(
    `update client 
    set archivedOn = '2020.12.21 09:00:00'
    where organization='${organizationName}'`,
    {
      plain: true,
      type: QueryTypes.UPDATE,
    },
  );

  return clientId;
}