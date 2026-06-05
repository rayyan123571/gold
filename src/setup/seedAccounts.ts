import bcrypt from 'bcryptjs'
import { db } from '@/db/db'

export async function seedTestAccount() {
  try {
    const count = await db.accounts.count()
    if (count === 0) {
      const hashed = await bcrypt.hash('test123', 10)
      await db.accounts.add({
        username: 'test',
        password_hash: hashed,
        created_at: new Date(),
      })
      console.log('Seeded test account: test / test123')
    } else {
      console.log('Accounts exist, skipping seed')
    }
    const clientsCount = await db.clients.count()
    if (clientsCount === 0) {
      await db.clients.add({
        code: '001',
        naam: 'Test Client',
        phone: '0000000000',
        balance_sona: 0,
        balance_cash: 0,
        created_at: new Date(),
      })
      console.log('Seeded sample client')
    }
  } catch (err) {
    console.error('Seeding test account failed', err)
  }
}
