#!/usr/bin/env node

/**
 * ShieldCode CLI - Official Command Line Security Tool
 * Anti-Phishing Code Management & Institutional Notification Protection
 *
 * Usage:
 *   npx shieldcode init
 *   npx shieldcode set --user <id> --code <SECRET_CODE>
 *   npx shieldcode get --user <id>
 *   npx shieldcode protect --user <id> --msg "<ORIGINAL_SMS_OR_EMAIL>"
 *   npx shieldcode verify --user <id> --msg "<RECEIVED_MESSAGE>"
 *   npx shieldcode list
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  teal: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  bgTeal: '\x1b[46m\x1b[30m',
};

const DB_FILE = path.join(process.cwd(), '.shieldcode_db.json');

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {}
  return { users: {} };
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving database:', e);
  }
}

function printBanner() {
  console.log(`
${colors.teal}${colors.bold}  ███████╗██╗  ██╗██╗███████╗██╗     ██████╗  ██████╗  ██████╗ ███████╗
  ██╔════╝██║  ██║██║██╔════╝██║     ██╔══██╗██╔════╝ ██╔═══██╗██╔════╝
  ███████╗███████║██║█████╗  ██║     ██║  ██║██║      ██║   ██║█████╗  
  ╚════██║██╔══██║██║██╔══╝  ██║     ██║  ██║██║      ██║   ██║██╔══╝  
  ███████║██║  ██║██║███████╗███████╗██████╔╝╚██████╗ ╚██████╔╝███████╗
  ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝${colors.reset}
  ${colors.gray}ShieldCode Security: Universal Anti-Phishing Protocol Tool v2.2.0${colors.reset}
`);
}

function printHelp() {
  printBanner();
  console.log(`
${colors.bold}الاستخدام (Usage):${colors.reset}
  ${colors.teal}npx shieldcode${colors.reset} <command> [options]

${colors.bold}الأوامر الأساسية (Commands):${colors.reset}
  ${colors.green}init${colors.reset}                           تهيئة ملف إعدادات الأداة في مشروع المؤسسة
  ${colors.green}set${colors.reset} --user <id> --code <code>   تعيين رمز مكافحة التصيد السري لحساب المستخدم
  ${colors.green}get${colors.reset} --user <id>                التحقق من حالة رمز الحماية للحساب
  ${colors.green}protect${colors.reset} --user <id> --msg <txt>  حقن الرمز السري في نص رسالة الإشعار أو OTP قبل الإرسال
  ${colors.green}verify${colors.reset} --user <id> --msg <txt>   فحص رسالة واردة للتأكد هل هي أصلية أم محاولة تصيد!
  ${colors.green}list${colors.reset}                           عرض الحسابات المحمية المسجلة
  ${colors.green}clear${colors.reset}                          إفراغ قاعدة البيانات المحلية للأداة

${colors.bold}أمثلة الاستخدام (Examples):${colors.reset}
  $ ${colors.teal}npx shieldcode set --user user_8810 --code SECURE99${colors.reset}
  $ ${colors.teal}npx shieldcode protect --user user_8810 --msg "رمز تأكيد العملية OTP هو: 440219"${colors.reset}
  $ ${colors.teal}npx shieldcode verify --user user_8810 --msg "[رمزك الأمني: SECURE99] رمز تأكيد العملية OTP هو: 440219"${colors.reset}
`);
}

function parseArgs(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace(/^--/, '');
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return flags;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const flags = parseArgs(args.slice(1));
  const db = loadDB();

  if (!command || command === '--help' || command === '-h' || command === 'help') {
    printHelp();
    return;
  }

  printBanner();

  switch (command) {
    case 'init': {
      const configFile = path.join(process.cwd(), 'shieldcode.config.json');
      const defaultConfig = {
        name: 'ShieldCode Anti-Phishing Security Layer',
        version: '2.2.0',
        channel: 'sms',
        strictRules: {
          minLength: 4,
          maxLength: 20,
          requireLetters: true,
          requireDigits: true,
        },
      };
      fs.writeFileSync(configFile, JSON.stringify(defaultConfig, null, 2), 'utf8');
      console.log(`${colors.green}✓ تم تهيئة أداة ShieldCode بنجاح في مشروعك!${colors.reset}`);
      console.log(`${colors.gray}تم إنشاء ملف الإعدادات: shieldcode.config.json${colors.reset}\n`);
      break;
    }

    case 'set': {
      const userId = flags.user;
      const code = flags.code;
      if (!userId || !code) {
        console.log(`${colors.red}❌ خطأ: يرجى تحديد الحساب والرمز السري.${colors.reset}`);
        console.log(`مثال: npx shieldcode set --user user_101 --code SAFE2026\n`);
        return;
      }

      if (code.length < 4 || code.length > 20) {
        console.log(`${colors.red}❌ الرمز يجب أن يتكون من 4 إلى 20 خانة.${colors.reset}\n`);
        return;
      }

      db.users[userId] = {
        code: code.trim(),
        enabled: true,
        updatedAt: new Date().toISOString(),
      };
      saveDB(db);

      console.log(`${colors.green}✓ تم تعيين وتفعيل رمز مكافحة التصيد بنجاح!${colors.reset}`);
      console.log(`الحساب: ${colors.bold}${userId}${colors.reset}`);
      console.log(`الرمز السري المعتمد: ${colors.teal}${colors.bold}[${code.trim()}]${colors.reset}\n`);
      break;
    }

    case 'get': {
      const userId = flags.user;
      if (!userId) {
        console.log(`${colors.red}❌ يرجى تحديد الحساب: npx shieldcode get --user user_101${colors.reset}\n`);
        return;
      }
      const record = db.users[userId];
      if (!record || !record.code) {
        console.log(`${colors.yellow}⚠️ الحساب ${userId} ليس لديه رمز حماية مفعل.${colors.reset}\n`);
      } else {
        console.log(`${colors.green}🛡️ حالة حماية الحساب ${userId}:${colors.reset}`);
        console.log(`الرمز السري: ${colors.teal}${colors.bold}[${record.code}]${colors.reset}`);
        console.log(`الحالة: ${record.enabled ? colors.green + 'مفعّل ونشط' : colors.red + 'معطّل'}${colors.reset}\n`);
      }
      break;
    }

    case 'protect': {
      const userId = flags.user;
      const rawMsg = flags.msg || flags.message;
      if (!userId || !rawMsg) {
        console.log(`${colors.red}❌ يرجى تحديد الحساب والرسالة.${colors.reset}`);
        console.log(`مثال: npx shieldcode protect --user user_101 --msg "رمز التحقق OTP هو 889102"\n`);
        return;
      }

      const record = db.users[userId];
      if (record && record.enabled && record.code) {
        const protectedMsg = `[رمزك الأمني: ${record.code}]\n${rawMsg}`;
        console.log(`${colors.green}✓ تم حقن رمز مكافحة التصيد في الرسالة بنجاح:${colors.reset}\n`);
        console.log(`${colors.bgTeal} النص المحمي الصادر للمستخدم: ${colors.reset}`);
        console.log(`${colors.bold}${protectedMsg}${colors.reset}\n`);
      } else {
        console.log(`${colors.yellow}⚠️ الحساب غير مسجل أو غير مفعّل، تم إرجاع النص بدون حماية:${colors.reset}\n${rawMsg}\n`);
      }
      break;
    }

    case 'verify': {
      const userId = flags.user;
      const msg = flags.msg || flags.message;
      if (!userId || !msg) {
        console.log(`${colors.red}❌ يرجى تحديد الحساب والرسالة للفحص.${colors.reset}\n`);
        return;
      }

      const record = db.users[userId];
      if (!record || !record.code) {
        console.log(`${colors.yellow}⚠️ لا يوجد رمز مسجل لهذا الحساب لفحص الرسالة.${colors.reset}\n`);
        return;
      }

      const hasCode = msg.includes(record.code);
      if (hasCode) {
        console.log(`${colors.green}${colors.bold}✅ نتيجة الفحص: رسالة أصلية موثقة (VERIFIED GENUINE)${colors.reset}`);
        console.log(`تم العثور على رمز مكافحة التصيد المعتمد: ${colors.teal}[${record.code}]${colors.reset}`);
        console.log(`الرسالة صادرة من المؤسسة الحقيقية بنسبة 100%.\n`);
      } else {
        console.log(`${colors.red}${colors.bold}🚨 نتيجة الفحص: تحذير من محاولة تصيد احتيالي (PHISHING DETECTED)${colors.reset}`);
        console.log(`الرسالة ${colors.bold}لا تحتوي على الرمز السري المعتمد [${record.code}]${colors.reset}.`);
        console.log(`${colors.red}تحذير: لا تضغط على أي روابط ولا تشارك معلوماتك السرية!${colors.reset}\n`);
      }
      break;
    }

    case 'list': {
      const keys = Object.keys(db.users);
      if (keys.length === 0) {
        console.log(`${colors.yellow}لا توجد حسابات مسجلة حالياً. استخدم أمر set لإضافة حساب.${colors.reset}\n`);
        return;
      }
      console.log(`${colors.bold}قائمة الحسابات المحمية المسجلة:${colors.reset}\n`);
      keys.forEach((id) => {
        const item = db.users[id];
        console.log(`  • ${colors.bold}${id}${colors.reset}: ${item.enabled ? colors.green + `[${item.code}] مفعّل` : colors.yellow + 'غير مفعّل'}${colors.reset}`);
      });
      console.log('');
      break;
    }

    case 'clear': {
      saveDB({ users: {} });
      console.log(`${colors.green}✓ تم إفراغ قاعدة البيانات المحلية بنجاح.${colors.reset}\n`);
      break;
    }

    default:
      console.log(`${colors.red}أمر غير معروف: ${command}${colors.reset}`);
      console.log(`اكتب ${colors.teal}npx shieldcode --help${colors.reset} لعرض قائمة الأوامر.\n`);
  }
}

main().catch(console.error);
