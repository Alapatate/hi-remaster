import { Account, Client, Databases } from 'react-native-appwrite';

const client = new Client()
  .setProject('69c2756f00254a9853ce')
  .setEndpoint('http://212.227.52.231:6677/v1');

const account = new Account(client);
const databases = new Databases(client);

// Configure these once you have created the database & collection in Appwrite
export const DATABASE_ID = '69c27797002b6eb93327';
export const VIDEOS_COLLECTION_ID = 'videos';
export const TEACHERS_COLLECTION_ID = 'teachers';

export { account, client, databases };
