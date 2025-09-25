INSERT INTO "User" (name, document, "passWord", role, "createdAt", "updatedAt")
SELECT 'Helder Chaves Leite Junior',
       '09355135408',
       '$2a$10$yAsIiaO9J3epW.6iQdgWieL/anwxnUHzzbGvo2WJNp.VISZ/UvSqi',
       'ADMINISTRATOR',
       NOW(),
       NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM "User" WHERE role = 'ADMINISTRATOR'
);