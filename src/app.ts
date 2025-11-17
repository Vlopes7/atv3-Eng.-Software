import express, { Request, Response } from "express";
import path from "path";
import mysql from "mysql2/promise";

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "fatec",
  database: "portfolio",
};

const pool = mysql.createPool(dbConfig);

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Conectado ao banco");
    connection.release();
  } catch (error: any) {
    console.error("Erro ao conectar com o MySQL:", error.message);
    process.exit(1);
  }
}

async function dbRun(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  const [result] = await pool.execute(sql, params);
  const okPacket = result as mysql.OkPacket;
  return {
    lastID: okPacket.insertId,
    changes: okPacket.affectedRows,
  };
}

async function dbGet<T>(sql: string, params: any[] = []): Promise<T | undefined> {
  const [rows] = await pool.execute(sql, params);
  const data = rows as T[];
  return data[0];
}

async function dbAll<T>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

async function seedDatabase() {
  try {
    const dadosCount = await dbGet<{ count: number }>("SELECT COUNT(*) as count FROM dados_pessoais");
    if (dadosCount && dadosCount.count === 0) {
      await dbRun("INSERT INTO dados_pessoais (nome, descricao) VALUES (?, ?)", [
        "Vinicius Lopes Machado",
        "Desenvolvedor Backend Java, Node.js e Python."
      ]);
    }

    const sobreCount = await dbGet<{ count: number }>("SELECT COUNT(*) as count FROM sobre");
    if (sobreCount && sobreCount.count === 0) {
      await dbRun("INSERT INTO sobre (apresentacao) VALUES (?)", [
        "Desenvolvedor Backend com foco na construção de APIs e microsserviços robustos, escaláveis e eficientes. Tenho experiência com Java (Spring Boot), Node.js (Express, TypeScript) e Python (Django). Meu trabalho é centrado na escrita de código limpo e testável para resolver problemas complexos de maneira lógica e com bom desempenho."
      ]);
    }

    const contatoCount = await dbGet<{ count: number }>("SELECT COUNT(*) as count FROM contato");
    if (contatoCount && contatoCount.count === 0) {
      await dbRun("INSERT INTO contato (email, github, linkedin) VALUES (?, ?, ?)", [
        "seu.email@gmail.com",
        "https://github.com/seu-usuario",
        "https://linkedin.com/in/seu-usuario"
      ]);
    }

    const formacoesCount = await dbGet<{ count: number }>("SELECT COUNT(*) as count FROM formacoes");
    if (formacoesCount && formacoesCount.count === 0) {
      const formacoes = [
        { "curso": "Análise e Desenvolvimento de Sistemas", "instituicao": "FATEC", "ano": "2024-2027" }
      ];
      for (const f of formacoes) {
        await dbRun("INSERT INTO formacoes (curso, instituicao, ano) VALUES (?, ?, ?)", [f.curso, f.instituicao, f.ano]);
      }
    }

    const hardskillsCount = await dbGet<{ count: number }>("SELECT COUNT(*) as count FROM hard_skills");
    if (hardskillsCount && hardskillsCount.count === 0) {
      const hardskills = [
        { "nomeHabilidade": "Linguagens", "habilidade": "Java, Python, JavaScript, TypeScript" },
        { "nomeHabilidade": "Frameworks Backend", "habilidade": "Spring Boot, Node.js, Express, Django" },
        { "nomeHabilidade": "Banco de Dados", "habilidade": "PostgreSQL, MySQL, MongoDB, Redis" }
      ];
      for (const h of hardskills) {
        await dbRun("INSERT INTO hard_skills (nomeHabilidade, habilidade) VALUES (?, ?)", [h.nomeHabilidade, h.habilidade]);
      }
    }

    const softskillsCount = await dbGet<{ count: number }>("SELECT COUNT(*) as count FROM soft_skills");
    if (softskillsCount && softskillsCount.count === 0) {
      const softskills = [
        { "habilidade": "Comunicação Efetiva" },
        { "habilidade": "Resolução de Problemas" },
        { "habilidade": "Trabalho em Equipe" }
      ];
      for (const s of softskills) {
        await dbRun("INSERT INTO soft_skills (habilidade) VALUES (?)", [s.habilidade]);
      }
    }

    const projetosCount = await dbGet<{ count: number }>("SELECT COUNT(*) as count FROM projetos");
    if (projetosCount && projetosCount.count === 0) {
      const projetos = [
        { "titulo": "Projeto Entrenova", "descricao": "Uma plataforma web completa com frontend e backend. (Adicione aqui mais detalhes sobre o projeto).", "tecnologias": "Node.js, React, Django, Supabase" },
        { "titulo": "Aplicação CRUD em Java", "descricao": "Sistema de gerenciamento de desktop focado nas operações de Criar, Ler, Atualizar e Deletar dados.", "tecnologias": "Java, JavaFX, MySQL" },
        { "titulo": "Site sobre Metodologia Ágil", "descricao": "Projeto em grupo para criar um site educacional com o objetivo de explicar os conceitos e a aplicação de metodologias ágeis.", "tecnologias": "HTML, CSS, JavaScript" },
        { "titulo": "IDE (Integrated Development Environment)", "descricao": "Ferramenta de desenvolvimento (IDE) customizada, criada em equipe como projeto acadêmico.", "tecnologias": "Java, (Outras bibliotecas)" }
      ];
      for (const p of projetos) {
        await dbRun("INSERT INTO projetos (titulo, descricao, tecnologias) VALUES (?, ?, ?)", [p.titulo, p.descricao, p.tecnologias]);
      }
    }

  } catch (err: any) {
    console.error("Erro ao popular o banco de dados:", err.message);
  }
}

(async () => {
  try {
    await testConnection();
    await dbRun(`CREATE TABLE IF NOT EXISTS dados_pessoais (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      nome TEXT,
      descricao TEXT
    )`);
    await dbRun(`CREATE TABLE IF NOT EXISTS sobre (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      apresentacao TEXT
    )`);
    await dbRun(`CREATE TABLE IF NOT EXISTS formacoes (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      curso TEXT,
      instituicao TEXT,
      ano TEXT
    )`);
    await dbRun(`CREATE TABLE IF NOT EXISTS soft_skills (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      habilidade TEXT
    )`);
    await dbRun(`CREATE TABLE IF NOT EXISTS hard_skills (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      nomeHabilidade TEXT,
      habilidade TEXT
    )`);
    await dbRun(`CREATE TABLE IF NOT EXISTS projetos (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      titulo TEXT,
      descricao TEXT,
      tecnologias TEXT
    )`);
    await dbRun(`CREATE TABLE IF NOT EXISTS contato (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      email TEXT,
      github TEXT,
      linkedin TEXT
    )`);

    await seedDatabase();

  } catch (err: any) {
    console.error("Erro ao criar tabelas:", err.message);
  }
})();

interface DadosPessoais {
  nome: string;
  descricao: string;
}
interface Sobre {
  apresentacao: string;
}
interface Formacao {
  id: number;
  curso: string;
  instituicao: string;
  ano: string;
}
interface SoftSkill {
  id: number;
  habilidade: string;
}
interface HardSkill {
  id: number;
  nomeHabilidade: string;
  habilidade: string;
}
interface Projeto {
  id: number;
  titulo: string;
  descricao: string;
  tecnologias?: string;
}
interface Contato {
  email: string;
  github: string;
  linkedin: string;
}

app.get("/", async (req: Request, res: Response) => {
  try {
    const [
      dadosPessoais,
      sobre,
      formacoes,
      softSkills,
      hardSkills,
      projetos,
      contato,
    ] = await Promise.all([
      dbGet<DadosPessoais>("SELECT * FROM dados_pessoais LIMIT 1"),
      dbGet<Sobre>("SELECT * FROM sobre LIMIT 1"),
      dbAll<Formacao>("SELECT * FROM formacoes"),
      dbAll<SoftSkill>("SELECT * FROM soft_skills"),
      dbAll<HardSkill>("SELECT * FROM hard_skills"),
      dbAll<Projeto>("SELECT * FROM projetos"),
      dbGet<Contato>("SELECT * FROM contato LIMIT 1"),
    ]);

    res.render("index", {
      dadosPessoais: dadosPessoais || { nome: "", descricao: "" },
      sobre: sobre || { apresentacao: "" },
      formacoes: formacoes || [],
      softSkills: softSkills || [],
      hardSkills: hardSkills || [],
      projetos: projetos || [],
      contato: contato || { email: "", github: "", linkedin: "" },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/dados", async (req: Request, res: Response) => {
  try {
    const row = await dbGet<DadosPessoais>("SELECT * FROM dados_pessoais LIMIT 1");
    res.json(row || { nome: "", descricao: "" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/dados", async (req: Request, res: Response) => {
  const { nome, descricao } = req.body;
  try {
    await dbRun("DELETE FROM dados_pessoais");
    const { lastID } = await dbRun(
      "INSERT INTO dados_pessoais (nome, descricao) VALUES (?, ?)",
      [nome, descricao]
    );
    res.json({ id: lastID, nome, descricao });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/dados", async (req: Request, res: Response) => {
  const { nome, descricao } = req.body;
  try {
    const { changes } = await dbRun(
      "UPDATE dados_pessoais SET nome = ?, descricao = ? WHERE id = (SELECT id FROM dados_pessoais LIMIT 1)",
      [nome, descricao]
    );
    res.json({ changes, nome, descricao });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/sobre", async (req: Request, res: Response) => {
  try {
    const row = await dbGet<Sobre>("SELECT * FROM sobre LIMIT 1");
    res.json(row || { apresentacao: "" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/sobre", async (req: Request, res: Response) => {
  const { apresentacao } = req.body;
  try {
    await dbRun("DELETE FROM sobre");
    const { lastID } = await dbRun(
      "INSERT INTO sobre (apresentacao) VALUES (?)",
      [apresentacao]
    );
    res.json({ id: lastID, apresentacao });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/sobre", async (req: Request, res: Response) => {
  const { apresentacao } = req.body;
  try {
    const { changes } = await dbRun(
      "UPDATE sobre SET apresentacao = ? WHERE id = (SELECT id FROM sobre LIMIT 1)",
      [apresentacao]
    );
    res.json({ changes, apresentacao });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/formacoes", async (req: Request, res: Response) => {
  try {
    const rows = await dbAll<Formacao>("SELECT * FROM formacoes");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/formacoes", async (req: Request, res: Response) => {
  const { curso, instituicao, ano } = req.body;
  try {
    const { lastID } = await dbRun(
      "INSERT INTO formacoes (curso, instituicao, ano) VALUES (?, ?, ?)",
      [curso, instituicao, ano]
    );
    res.json({ id: lastID, curso, instituicao, ano });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/formacoes/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { curso, instituicao, ano } = req.body;
  try {
    const { changes } = await dbRun(
      "UPDATE formacoes SET curso = ?, instituicao = ?, ano = ? WHERE id = ?",
      [curso, instituicao, ano, id]
    );
    if (changes === 0)
      return res.status(404).json({ message: "Formação não encontrada" });
    res.json({ id, curso, instituicao, ano });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/formacoes/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const { changes } = await dbRun("DELETE FROM formacoes WHERE id = ?", [id]);
    if (changes === 0)
      return res.status(404).json({ message: "Formação não encontrada" });
    res.sendStatus(204);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/softskills", async (req: Request, res: Response) => {
  try {
    const rows = await dbAll<SoftSkill>("SELECT * FROM soft_skills");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/softskills", async (req: Request, res: Response) => {
  const { habilidade } = req.body;
  try {
    const { lastID } = await dbRun(
      "INSERT INTO soft_skills (habilidade) VALUES (?)",
      [habilidade]
    );
    res.json({ id: lastID, habilidade });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/softskills/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { habilidade } = req.body;
  try {
    const { changes } = await dbRun(
      "UPDATE soft_skills SET habilidade = ? WHERE id = ?",
      [habilidade, id]
    );
    if (changes === 0)
      return res.status(404).json({ message: "Soft skill não encontrada" });
    res.json({ id, habilidade });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/softskills/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const { changes } = await dbRun("DELETE FROM soft_skills WHERE id = ?", [
      id,
    ]);
    if (changes === 0)
      return res.status(404).json({ message: "Soft skill não encontrada" });
    res.sendStatus(204);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/hardskills", async (req: Request, res: Response) => {
  try {
    const rows = await dbAll<HardSkill>("SELECT * FROM hard_skills");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/hardskills", async (req: Request, res: Response) => {
  const { nomeHabilidade, habilidade } = req.body;
  try {
    const { lastID } = await dbRun(
      "INSERT INTO hard_skills (nomeHabilidade, habilidade) VALUES (?, ?)",
      [nomeHabilidade, habilidade]
    );
    res.json({ id: lastID, nomeHabilidade, habilidade });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/hardskills/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { nomeHabilidade, habilidade } = req.body;
  try {
    const { changes } = await dbRun(
      "UPDATE hard_skills SET nomeHabilidade = ?, habilidade = ? WHERE id = ?",
      [nomeHabilidade, habilidade, id]
    );
    if (changes === 0)
      return res.status(404).json({ message: "Hard skill não encontrada" });
    res.json({ id, nomeHabilidade, habilidade });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/hardskills/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const { changes } = await dbRun("DELETE FROM hard_skills WHERE id = ?", [
      id,
    ]);
    if (changes === 0)
      return res.status(404).json({ message: "Hard skill não encontrada" });
    res.sendStatus(204);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/projetos", async (req: Request, res: Response) => {
  try {
    const rows = await dbAll<Projeto>("SELECT * FROM projetos");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/projetos", async (req: Request, res: Response) => {
  const { titulo, descricao, tecnologias } = req.body;
  try {
    const { lastID } = await dbRun(
      "INSERT INTO projetos (titulo, descricao, tecnologias) VALUES (?, ?, ?)",
      [titulo, descricao, tecnologias]
    );
    res.json({ id: lastID, titulo, descricao, tecnologias });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/projetos/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { titulo, descricao, tecnologias } = req.body;
  try {
    const { changes } = await dbRun(
      "UPDATE projetos SET titulo = ?, descricao = ?, tecnologias = ? WHERE id = ?",
      [titulo, descricao, tecnologias, id]
    );
    if (changes === 0)
      return res.status(404).json({ message: "Projeto não encontrado" });
    res.json({ id, titulo, descricao, tecnologias });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/projetos/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const { changes } = await dbRun("DELETE FROM projetos WHERE id = ?", [id]);
    if (changes === 0)
      return res.status(404).json({ message: "Projeto não encontrado" });
    res.sendStatus(204);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/contato", async (req: Request, res: Response) => {
  const { email, github, linkedin } = req.body;
  try {
    await dbRun("DELETE FROM contato");
    const { lastID } = await dbRun(
      "INSERT INTO contato (email, github, linkedin) VALUES (?, ?, ?)",
      [email, github, linkedin]
    );
    res.json({ id: lastID, email, github, linkedin });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/contato", async (req: Request, res: Response) => {
  const { email, github, linkedin } = req.body;
  try {
    const { changes } = await dbRun(
      "UPDATE contato SET email = ?, github = ?, linkedin = ? WHERE id = (SELECT id FROM contato LIMIT 1)",
      [email, github, linkedin]
    );
    res.json({ changes, email, github, linkedin });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/contato", async (req: Request, res: Response) => {
  try {
    await dbRun("DELETE FROM contato");
    res.json({ message: "Contato deletado com sucesso" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em: http://localhost:${PORT}`);
});