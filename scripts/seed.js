// Deterministic, idempotent MongoDB seed data shared by all backend implementations.
// Safe to re-run: uses fixed ObjectIds and upserts rather than inserts.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGO_ROOT_USER = process.env.MONGO_ROOT_USER || 'admin';
const MONGO_ROOT_PASSWORD = process.env.MONGO_ROOT_PASSWORD || 'password';
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'collaborative-dashboard';
const MONGODB_URI =
  process.env.MONGODB_URI ||
  `mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@localhost:27017/${MONGO_DB_NAME}?authSource=admin`;

// Fixed IDs keep every backend (Node, FastAPI, Java, C#) querying the same demo records.
const USER_ID = new ObjectId('000000000000000000000001');
const BOARD_ID = new ObjectId('000000000000000000000101');
const TASK_LOGIN_UI_ID = new ObjectId('000000000000000000001001');
const TASK_BOARD_LIST_ID = new ObjectId('000000000000000000001002');
const TASK_BOARD_VIEW_ID = new ObjectId('000000000000000000001003');

const BOARD_COLUMNS = ['To Do', 'In Progress', 'Done'];

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  try {
    const db = client.db(MONGO_DB_NAME);
    const now = new Date();

    const passwordHash = await bcrypt.hash('test123', 10);

    await db.collection('users').updateOne(
      { _id: USER_ID },
      {
        $set: {
          email: 'don.flannagan@gmail.com',
          password: passwordHash,
          username: 'dflannagan',
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    await db.collection('boards').updateOne(
      { _id: BOARD_ID },
      {
        $set: {
          title: 'Backlog',
          description: 'Seeded demo board for dflannagan',
          owner: USER_ID,
          members: [USER_ID],
          columns: BOARD_COLUMNS,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    const tasks = [
      {
        _id: TASK_LOGIN_UI_ID,
        title: 'Add UI to login',
        description: 'Build the login form and wire it to backend authentication.',
        columnId: 'To Do',
        position: 0,
        priority: 'high',
        tags: ['frontend', 'auth'],
      },
      {
        _id: TASK_BOARD_LIST_ID,
        title: "View current user's list of boards",
        description: "Render the boards owned by or shared with the logged-in user.",
        columnId: 'To Do',
        position: 1,
        priority: 'medium',
        tags: ['frontend', 'boards'],
      },
      {
        _id: TASK_BOARD_VIEW_ID,
        title: 'View a board',
        description: 'Render a single board with its columns and tasks.',
        columnId: 'To Do',
        position: 2,
        priority: 'medium',
        tags: ['frontend', 'boards'],
      },
    ];

    for (const task of tasks) {
      await db.collection('tasks').updateOne(
        { _id: task._id },
        {
          $set: {
            title: task.title,
            description: task.description,
            boardId: BOARD_ID,
            columnId: task.columnId,
            position: task.position,
            assignee: USER_ID,
            priority: task.priority,
            tags: task.tags,
            createdBy: USER_ID,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      );
    }

    console.log('Seed complete:');
    console.log(`  user:  ${USER_ID} (don.flannagan@gmail.com / dflannagan)`);
    console.log(`  board: ${BOARD_ID} (Backlog)`);
    console.log(`  tasks: ${TASK_LOGIN_UI_ID}, ${TASK_BOARD_LIST_ID}, ${TASK_BOARD_VIEW_ID}`);
  } finally {
    await client.close();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
