// deploy-commands.js
// ✅ เวอร์ชันใหม่ — ใช้งานง่าย แค่เลือก Guild หรือ Global ตอนรัน
// รองรับการล้าง (clear) และ deploy แบบอัตโนมัติ

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { REST, Routes } = require("discord.js");

const rl = readline.createInterface({
  input: process.stdin,
    output: process.stdout,
    });

    function loadCommands() {
      const commands = [];
        const commandsPath = path.join(__dirname, "commands");

          function readDir(dir) {
              for (const file of fs.readdirSync(dir, { withFileTypes: true })) {
                    const full = path.join(dir, file.name);
                          if (file.isDirectory()) readDir(full);
                                else if (file.isFile() && file.name.endsWith(".js")) {
                                        const cmd = require(full);
                                                if (cmd?.data?.toJSON) commands.push(cmd.data.toJSON());
                                                      }
                                                          }
                                                            }

                                                              if (fs.existsSync(commandsPath)) readDir(commandsPath);
                                                                return commands;
                                                                }

                                                                async function pushCommands({ guildMode, clear }) {
                                                                  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
                                                                    const appId = process.env.CLIENT_ID;
                                                                      const guildId = process.env.GUILD_ID;

                                                                        if (!appId) throw new Error("❌ ไม่พบ CLIENT_ID ใน .env");
                                                                          if (guildMode && !guildId) throw new Error("❌ ไม่พบ GUILD_ID ใน .env");

                                                                            const body = clear ? [] : loadCommands();

                                                                              console.log(clear ? "🧹 กำลังล้างคำสั่ง..." : "🚀 กำลัง deploy คำสั่ง...");

                                                                                try {
                                                                                    if (guildMode) {
                                                                                          await rest.put(Routes.applicationGuildCommands(appId, guildId), { body });
                                                                                                console.log(clear ? "✅ ล้างคำสั่ง Guild สำเร็จ!" : "✅ Deploy Guild สำเร็จ!");
                                                                                                    } else {
                                                                                                          await rest.put(Routes.applicationCommands(appId), { body });
                                                                                                                console.log(clear ? "✅ ล้างคำสั่ง Global สำเร็จ!" : "✅ Deploy Global สำเร็จ!");
                                                                                                                    }
                                                                                                                      } catch (err) {
                                                                                                                          console.error("❌ เกิดข้อผิดพลาด:", err);
                                                                                                                            }
                                                                                                                            }

                                                                                                                            rl.question("🌐 ต้องการทำกับ Global หรือ Guild? (พิมพ์ g = Guild / w = World) ➜ ", (scope) => {
                                                                                                                              const guildMode = scope.toLowerCase() === "g";
                                                                                                                                rl.question("⚙️ ต้องการ (d) Deploy หรือ (c) Clear ? ➜ ", async (mode) => {
                                                                                                                                    const clear = mode.toLowerCase() === "c";
                                                                                                                                        rl.close();
                                                                                                                                            await pushCommands({ guildMode, clear });
                                                                                                                                              });
                                                                                                                                              });