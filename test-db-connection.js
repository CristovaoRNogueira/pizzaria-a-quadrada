import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function login(email, password) {
  const user = await prisma.admin.findUnique({ where: { email } });

  if (!user) {
    console.log("Usuário não encontrado");
    return false;
  }

  if (!user.isActive) {
    console.log("Usuário desativado");
    return false;
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    console.log("Senha incorreta");
    return false;
  }

  console.log("Login bem-sucedido para:", user.email);
  return true;
}

login("admin@pizzariaquadrada.com", "pizzaria2024").then((success) => {
  console.log("Resultado do login:", success);
});
