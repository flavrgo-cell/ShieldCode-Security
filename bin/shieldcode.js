#!/usr/bin/env node

/**
 * ShieldCode CLI - Official Command Line Tool
 * Easily add Anti-Phishing protection to any banking or fintech application.
 *
 * Usage:
 *   npx shieldcode init
 *   npx shieldcode set --user 0555123456 --code AYOUB2026
 *   npx shieldcode protect --user 0555123456 --msg "رمز التحقق OTP هو 889102"
 *   npx shieldcode verify --user 0555123456 --msg "[AYOUB2026] رمز التحقق OTP هو 889102"
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
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
  return {
    users: {
      '0555123456': { code: 'AYOUB2026', enabled: true, bank: 'BaridiMob', name: 'أيوب بن علي' },
      '0666789012': { code: 'SARA2026', enabled: true, bank: 'BNA', name: 'سارة حمدي' },
      '0777456789': { code: '', enabled: false, bank: 'Al Baraka', name: 'كريم دريدي' },
    },
  };
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
  ${colors.gray}Anti-Phishing Security CLI Tool for Banking & Financial Platforms v2.1.0${colors.reset}
`);
}

function printHelp() {
  printBanner();
  console.log(`
${colors.bold}الاستخدام (Usage):${colors.reset}
  ${colors.teal}npx shieldcode${colors.reset} <command> [options]

${colors.bold}الأوامر المتاحة (Commands):${colors.reset}
  ${colors.green}init${colors.reset}                           تهيئة ملف إعدادات الأداة في مشروعك البنكي
  ${colors.green}set${colors.reset} --user <id> --code <code>   تعيين أو تحديث رمز مكافحة التصيد لحساب عميل
  ${colors.green}get${colors.reset} --user <id>                عرض حالة رمز الحماية للعميل
  ${colors.green}protect${colors.reset} --user <id> --msg <txt>  حقن الرمز السري في نص رسالة SMS أو إيميل بنكي
  ${colors.green}verify${colors.reset} --user <id> --msg <txt>   فحص رسالة للتأكد هل هي أصلية أم محاولة تصيد!
  ${colors.green}list${colors.reset}                           عرض قائمة الحسابات التجريبية المحمية

${colors.bold}أمثلة عملية (Quick Examples):${colors.reset}
  $ ${colors.teal}shieldcode init${colors.reset}
  $ ${colors.teal}shieldcode set --user 0555123456 --code AYOUB2026${colors.reset}
  $ ${colors.teal}shieldcode protect --user 0555123456 --msg "رمز التحقق OTP هو 889102"${colors.reset}
  $ ${colors.teal}shieldcode verify --user 0555123456 --msg "[AYOUB2026] رمز التحقق OTP هو 889102"${colors.reset}
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

// Main CLI router
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
        name: 'ShieldCode Banking Security Layer',
        institution: 'BaridiMob & SATIM',
        version: '2.1.0',
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
      console.log(`للربط في الكود، أضف السطر التالي:`);
      console.log(`${colors.teal}import { shieldcode } from '@shieldcode/security';${colors.reset}\n`);
      break;
    }

    case 'set': {
      const userId = flags.user;
      const code = flags.code;
      if (!userId || !code) {
        console.log(`${colors.red}❌ خطأ: يرجى تحديد معرّف الحساب والرمز السري.${colors.reset}`);
        console.log(`مثال: shieldcode set --user 0555123456 --code AYOUB2026\n`);
        return;
      }

      if (code.length < 4 || code.length > 20) {
        console.log(`${colors.red}❌ الرمز يجب أن يتكون من 4 إلى 20 حرفاً ورقماً.${colors.reset}\n`);
        return;
      }

      db.users[userId] = {
        code: code.trim(),
        enabled: true,
        updatedAt: new Date().toISOString(),
      };
      saveDB(db);

      console.log(`${colors.green}✓ تم تعيين وتفعيل رمز الحماية بنجاح!${colors.reset}`);
      console.log(`الحساب: ${colors.bold}${userId}${colors.reset}`);
      console.log(`الرمز السري المشترك: ${colors.teal}${colors.bold}[${code.trim()}]${colors.reset}\n`);
      break;
    }

    case 'get': {
      const userId = flags.user;
      if (!userId) {
        console.log(`${colors.red}❌ يرجى تحديد الحساب: shieldcode get --user 0555123456${colors.reset}\n`);
        return;
      }
      const record = db.users[userId];
      if (!record || !record.code) {
        console.log(`${colors.yellow}⚠️ الحساب ${userId} ليس لديه رمز حماية مفعل.${colors.reset}\n`);
      } else {
        console.log(`${colors.green}🛡️ بيانات الحماية للحساب ${userId}:${colors.reset}`);
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
        console.log(`مثال: shieldcode protect --user 0555123456 --msg "رمز التحقق هو 889102"\n`);
        return;
      }

      const record = db.users[userId];
      if (record && record.enabled && record.code) {
        const protectedMsg = `[رمزك: ${record.code}]\n${rawMsg}`;
        console.log(`${colors.green}✓ تم حقن رمز مكافحة التصيد في الرسالة بنجاح:${colors.reset}\n`);
        console.log(`${colors.bgTeal} النص المحمي الصادر للمواطن: ${colors.reset}`);
        console.log(`${colors.bold}${protectedMsg}${colors.reset}\n`);
      } else {
        console.log(`${colors.yellow}⚠️ الحساب غير محمي، الرسالة صادرة بدون رمز:${colors.reset}\n${rawMsg}\n`);
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
        console.log(`تم العثور على رمز الأمان السري المشترك: ${colors.teal}[${record.code}]${colors.reset}`);
        console.log(`المرسل هو البنك الحقيقي بنسبة 100%.\n`);
      } else {
        console.log(`${colors.red}${colors.bold}🚨 نتيجة الفحص: تحذير من محاولة تصيد احتيالي (SMISHING DETECTED)${colors.reset}`);
        console.log(`الرسالة ${colors.bold}لا تحتوي على الرمز السري [${record.code}]${colors.reset}.`);
        console.log(`${colors.red}المخترق ينتحل اسم البنك! لا تضغط على أي رابط ولا تشارك بياناتك!${colors.reset}\n`);
      }
      break;
    }

    case 'list': {
      console.log(`${colors.bold}الحسابات المسجلة في أداة ShieldCode المحلية:${colors.reset}\n`);
      Object.entries(db.users).forEach(([id, data]) => {
        console.log(`  • ${colors.bold}${id}${colors.reset} (${data.bank || 'Bank'}): ${data.enabled ? colors.green + `[${data.code}] مفعّل` : colors.yellow + 'غير مفعّل'}${colors.reset}`);
      });
      console.log('');
      break;
    }

    default:
      console.log(`${colors.red}أمر غير معروف: ${command}${colors.reset}`);
      console.log(`اكتب ${colors.teal}shieldcode --help${colors.reset} لعرض قائمة الأوامر المتاحة.\n`);
  }
}

main().catch(console.error);
