import { MongoClient } from "mongodb";

const { DB_MONGODB_URI: uri, DB_MONGODB_NAME: databaseName } = process.env;
if (!uri || !databaseName) {
  throw new Error("Configura DB_MONGODB_URI y DB_MONGODB_NAME para preparar la votación.");
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
try {
  const votes = client.db(databaseName).collection("votos_inmobiliarias");
  const index = await votes.createIndex(
    { inmobiliariaId: 1, email: 1 },
    {
      name: "voto_unico_por_inmobiliaria_y_correo",
      unique: true,
      collation: { locale: "en", strength: 2 },
    },
  );
  console.log(`${databaseName}: ${index}`);
} catch (error) {
  console.error("No se pudo preparar el índice de votos.", error.name, error.code ?? "");
  process.exitCode = 1;
} finally {
  await client.close();
}
