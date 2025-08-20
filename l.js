// api/bot.js
const { createServer } = require('http');
const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const express = require('express');
const app = express();

// Configuration
const apiId = parseInt(process.env.API_ID) || 23209699;
const apiHash = process.env.API_HASH || '914c6b8aa854364d0f0a7885f53bf595';
const sessionName = process.env.SESSION_NAME || 'luiselfbot';

// Global variables
let spamming = false;
let autoRantTarget = null;
let autoMockTarget = null;
let autoMockEnabled = false;
let autoReplyTarget = null;
let autoReplyEnabled = false;
let asrEnabled = false;
let dualTargets = [];

// Insult database (unchanged from your original)
const VZKOU_INSULTS = [
    "1% NA NGA LANG NG LAKAS KO GINAGAMIT KO SAYO HIRAP KAPA RIN? GANYAN KABA TALAGA KAHINA ASO KO",
    "HOY TABATCHOY NA BISAYA KESA TULUNGAN MO NALANG MAGTANIM NG PALAY SA BUKID MAGULANG MO E MAS NAUNA MO PANG KALABANIN YUNG BOSS MO ASO KO",
    "MALI KA ATA NG NILUGARAN DAPAT NASA BASURAHAN KA NEGRO DI KA BELONG DITO",
    "FLOODED BY LUI",
    "TANGINAMO SOBRANG BOBO",
    "SUMABAY KA TANGA",
    "SUCK MO DICK KO SAGAD",
    "TAE TAE LANG SIGURO LAMAN NG UTAK MO ANG BANTOT BA NAMAN LUMETRA HSHAHAHAA",
    "WALA KA PALA SA AMO MO E KINGINAMO HOY",
    "HOY BOBO FLO FLOOD KITA TANGA",
    "KILALANIN MO BINABANGGA MO BOBO",
    "BOSS MO SI LUI OKIE",
    "TANGINAMO TAMOD KITA",
    "TANGINAMO SASABAY KAPA",
    "WHAHAHAH BAGONG SIBOL KA PALANG FINAL BOSS NA AGAD KINALABAN MO LAIT TULOY NATAMO MO",
    "WHAHAHAHA IYAK DI MAKAISA SI OBESE GOD BA NAMAN KINALABAN NIYA E",
    "ANO PAPALAG KA SA AMO MO",
    "GUSTO MO GAWIN KITANG SEX SLAVE",
    "WALA KA PALA SA BOSS MO E",
    "BROKE BOY KA GAGO",
    "SLAVE LANG KITA WAG KANA UMANGAL",
    "TANGINAMO NIGGA",
    "PAHASA KA MUNA SA MGA KABARO MO BAGO MOKO SUBUKAN NAG MIMISTULANG ANIMAL ABUSING LABAN NATIN DAHIL NAGPAPAKAHAYOP KA E",
    "KAKANTUTIN KO NANAY MONG MALUWAG",
    "TG GUSTO LIGO AYAW? WELL UNDERSTANDABLE NAMAN NA SA ITSURA PA LANG HALATANG MAASIM KANG MATABA KA",
    "BOBO MATULOG KANA",
    "HAHA TANGINAKA SABAYAN HOY",
    "MALAS MO HOY PINANGANAK KA LANG PARA BATUK-BATUKAN RITO SA TG",
    "WALA KA EA MO SAKIN NA",
    "BABOY SPOTTED",
    "ISA KANG BANONG TANGA",
    "ANONG BREED NG ASO KA?",
    "GAME NA BOBO TANGINAMO KAA",
    "WHAHASHAHAHA DI MOKO KAYA MATULOG KA NALANG ATABS",
    "KINGINANG BABOY TO PANO KA TATAGOS E HINDI KA NGA GUMAGAMIT NG UTAK",
    "SUSUBOK KA PA E KITANG KITA NAMAN YUNG AGWAT SA LEVEL NATEN HAHAHAHAA",
    "LUI AMO MO WAG KANA UMANGAL BASURA",
    "AAPAK APAKAN KO LANG PAGKATAO MO HAMPAS LUPA",
    "PALAMUNIN KA LANG TABATCHOY USO EXERCISE",
    "TANGINAMO TAMOD KITA",
    "BUGOK KA TANGA",
    "ISA KANG ALIPIN KO HAHA",
    "WALA KA EA MO SAKIN NA",
    "SLAVE LANG KITA WAG KANA UMANGAL",
    "ANONG BREED NG ASO KA?",
    "ANO PAPALAG KA SA AMO MO",
    "WAG SANA DASHOUT PLS",
    "TG GUSTO LIGO AYAW? WELL UNDERSTANDABLE NAMAN NA SA ITSURA PA LANG HALATANG MAASIM KANG MATABA KA",
    "WAG KA MA STRESS BAKA MANGAYAYAT KA SA SOBRANG TABA MO HAHA",
    "ANO TANGA FLOODED KA NA HAHA",
    "MALI KA ATA NG NILUGARAN DAPAT NASA BASURAHAN KA NEGRO DI KA BELONG DITO",
    "BATUKAN LANG KITA",
    "ISA KANG LOW LEVEL NA TANGA WAG KANANG UMASANG KAYA MOKO HAHAHA",
    "SUMABAY KA TANGA",
    "WELL ANO PA NGA BA AASAHAN KO SAYO MAHIRAP KA NA NGA UNEDUCATED PA BWSHAHAHAQ HAMPAS LUPA",
    "HUMANAP KA NG TALI SABAY BIGTI MO SARILI MO TUTAL WALA KA NAMANG SILBI SA MUNDO",
    "BAGAL MO TANGA",
    "WALA KA TANGA",
    "AHAHAHAHAHAHA KAHIT ILANG HAMPAS LUPA PA NA KAGAYA MO ISAMA MO DI MOKO KAKAYANIN NIGGA",
    "MAGBIGTI KA NALANG KENGKOY PARA MABAWASAN NAMAN YUNG MGA TANGA SA MUNDO",
    "WALA KA PALA SA AMO MO E KINGINAMO HOY",
    "SUSUBOK KA PA E KITANG KITA NAMAN YUNG AGWAT SA LEVEL NATEN HAHAHAHAA",
    "LUI AMO MO WAG KANA UMANGAL BASURA",
    "HSHAHAHA HOYY USO GUMAMIT NG UTAK KUNG MERON KA MAN WAG PURO TANONG KAY CHATGPT KUNG ANONG GAGAWIN RETARDED",
    "LUGI MGA TRANSPORTS SAYO KATUMBAS MO BA NAMAN LAHAT NG TAONG DAPAT SASAKAY KAPAG NARIRIYAN KA E",
    "AAPAK APAKAN KO LANG PAGKATAO MO HAMPAS LUPA",
    "BROKE BOY KA GAGO",
    "KUNG AKO SAYO MAGPAKAMATAY KA NALANG WALA KANG MARARATING HOY PAGIGING PULUBE LANG KABABAGSAKAN MO",
    "WALA KANG SILBI SA MUNDO MAGPAKAMATAY KA NALANG",
    "ANO HAHA",
    "HOY OBESE SAN KA NA",
    "MAG EXERCISE KA NAMAN PARA MABAWASAN FATS NG KATAWAN MO TABATCHOY",
    "BALITA KO LAGI MO RAW INUUBOS MGA ULAM NIYO SA ISANG ARAW AH? MAGTIRA KA NAMAN BABOY",
    "REMEMBER MY NAME TANGA",
    "LUI ON TOP",
    "HSHAHAHAQ TANGINAMO MAHINA LUMAPAG KA NAMAN NAKIKILITI LANG EGO KO SAYONG TANGA KA E",
    "ANO KAYA MO PABA BIGBACK?",
    "NAPAKA BAGAL MO MAG TYPE",
    "KAYA PALA NAPAKA BOBO MO TAGA MINDANAO KA PALA HSHAHAHA",
    "BOBO KA HAHA DI KA TATAGOS",
    "WAG KA DASH OUT HANGGANG UMAGA TAYO DITO",
    "HSHAHAHA ALIPIN LANG KITANG TANGA KA",
    "WHAHAHAHAHA SAN KANA BABOY WALANG WALA NA BA?",
    "ISA KANG LOW LEVEL NA TANGA WAG KANANG UMASANG KAYA MOKO HAHAHA",
    "TANGINAMO SOBRANG BOBO",
    "HAHAHAHA DI NAMAMATAY TONG BOT KO 24/7 TO TANGA WAG KANA UMASA FLOODED KANA BOBO",
    "WALA KA TANGA",
    "KAHIT PITY DI KO NARARAMDAMAN SAYONG HAMPAS LUPA KA NANDIDIRI AKO SAYO",
    "WALA KA PALA SA AMO MO E KINGINAMO HOY",
    "WHAHASHAHAHA DI MOKO KAYA MATULOG KA NALANG ATABS",
    "KAKANTUTIN KO NANAY MONG MALUWAG",
    "SLAVE KITA BANO",
    "BOSS MO SI LUI OKIE",
    "D.O KANA BOBO UNSTOPPABLE TO",
    "BISAKOL PUTANGINAMO",
    "DILAAN MO SAPATOS KO BIGBACK",
    "KUNG AKO SAYO MAGPAKAMATAY KA NALANG WALA KANG MARARATING HOY PAGIGING PULUBE LANG KABABAGSAKAN MO",
    "TANGINAMO NIGGA",
    "SUSUBOK KA PA E KITANG KITA NAMAN YUNG AGWAT SA LEVEL NATEN HAHAHAHAA",
    "BALITA KO LAGI MO RAW INUUBOS MGA ULAM NIYO SA ISANG ARAW AH? MAGTIRA KA NAMAN BABOY",
    "SAN KANA BOBO",
    "PAPALAG KAPANG TANGA KA?",
    "LUI AMO MO WAG KANA UMANGAL BASURA",
    "AAPAK APAKAN KO LANG PAGKATAO MO HAMPAS LUPA",
    "PALAMUNIN KA LANG TABATCHOY USO EXERCISE",
    "TANGINAMO TAMOD KITA",
    "BUGOK KA TANGA",
    "ISA KANG ALIPIN KO HAHA",
    "WALA KA EA MO SAKIN NA",
    "SLAVE LANG KITA WAG KANA UMANGAL",
    "ANONG BREED NG ASO KA?",
    "ANO PAPALAG KA SA AMO MO",
    "WAG SANA DASHOUT PLS",
    "TG GUSTO LIGO AYAW? WELL UNDERSTANDABLE NAMAN NA SA ITSURA PA LANG HALATANG MAASIM KANG MATABA KA",
    "WAG KA MA STRESS BAKA MANGAYAYAT KA SA SOBRANG TABA MO HAHA",
    "ANO TANGA FLOODED KA NA HAHA",
    "MALI KA ATA NG NILUGARAN DAPAT NASA BASURAHAN KA NEGRO DI KA BELONG DITO",
    "BATUKAN LANG KITA",
    "ISA KANG LOW LEVEL NA TANGA WAG KANANG UMASANG KAYA MOKO HAHAHA",
    "SUMABAY KA TANGA",
    "WELL ANO PA NGA BA AASAHAN KO SAYO MAHIRAP KA NA NGA UNEDUCATED PA BWSHAHAHAQ HAMPAS LUPA",
    "HUMANAP KA NG TALI SABAY BIGTI MO SARILI MO TUTAL WALA KA NAMANG SILBI SA MUNDO",
    "BAGAL MO TANGA",
    "WALA KA TANGA",
    "AHAHAHAHAHAHA KAHIT ILANG HAMPAS LUPA PA NA KAGAYA MO ISAMA MO DI MOKO KAKAYANIN NIGGA",
    "MAGBIGTI KA NALANG KENGKOY PARA MABAWASAN NAMAN YUNG MGA TANGA SA MUNDO",
    "WALA KA PALA SA AMO MO E KINGINAMO HOY",
    "SUSUBOK KA PA E KITANG KITA NAMAN YUNG AGWAT SA LEVEL NATEN HAHAHAHAA",
    "LUI AMO MO WAG KANA UMANGAL BASURA",
    "HSHAHAHA HOYY USO GUMAMIT NG UTAK KUNG MERON KA MAN WAG PURO TANONG KAY CHATGPT KUNG ANONG GAGAWIN RETARDED",
    "LUGI MGA TRANSPORTS SAYO KATUMBAS MO BA NAMAN LAHAT NG TAONG DAPAT SASAKAY KAPAG NARIRIYAN KA E",
    "AAPAK APAKAN KO LANG PAGKATAO MO HAMPAS LUPA",
    "BROKE BOY KA GAGO",
    "KUNG AKO SAYO MAGPAKAMATAY KA NALANG WALA KANG MARARATING HOY PAGIGING PULUBE LANG KABABAGSAKAN MO",
    "WALA KANG SILBI SA MUNDO MAGPAKAMATAY KA NALANG",
    "ANO HAHA",
    "HOY OBESE SAN KA NA",
    "MAG EXERCISE KA NAMAN PARA MABAWASAN FATS NG KATAWAN MO TABATCHOY",
    "BALITA KO LAGI MO RAW INUUBOS MGA ULAM NIYO SA ISANG ARAW AH? MAGTIRA KA NAMAN BABOY",
    "REMEMBER MY NAME TANGA",
    "LUI ON TOP",
    "HSHAHAHAQ TANGINAMO MAHINA LUMAPAG KA NAMAN NAKIKILITI LANG EGO KO SAYONG TANGA KA E",
    "ANO KAYA MO PABA BIGBACK?",
    "NAPAKA BAGAL MO MAG TYPE",
    "KAYA PALA NAPAKA BOBO MO TAGA MINDANAO KA PALA HSHAHAHA",
    "BOBO KA HAHA DI KA TATAGOS",
    "WAG KA DASH OUT HANGGANG UMAGA TAYO DITO",
    "HSHAHAHA ALIPIN LANG KITANG TANGA KA",
    "WHAHAHAHAHA SAN KANA BABOY WALANG WALA NA BA?",
    "ISA KANG LOW LEVEL NA TANGA WAG KANANG UMASANG KAYA MOKO HAHAHA",
    "TANGINAMO SOBRANG BOBO",
    "HAHAHAHA DI NAMAMATAY TONG BOT KO 24/7 TO TANGA WAG KANA UMASA FLOODED KANA BOBO",
    "WALA KA TANGA",
    "KAHIT PITY DI KO NARARAMDAMAN SAYONG HAMPAS LUPA KA NANDIDIRI AKO SAYO",
    "WALA KA PALA SA AMO MO E KINGINAMO HOY",
    "WHAHASHAHAHA DI MOKO KAYA MATULOG KA NALANG ATABS",
    "KAKANTUTIN KO NANAY MONG MALUWAG",
    "SLAVE KITA BANO",
    "BOSS MO SI LUI OKIE",
    "D.O KANA BOBO UNSTOPPABLE TO",
    "BISAKOL PUTANGINAMO",
    "DILAAN MO SAPATOS KO BIGBACK",
    "KUNG AKO SAYO MAGPAKAMATAY KA NALANG WALA KANG MARARATING HOY PAGIGING PULUBE LANG KABABAGSAKAN MO",
    "TANGINAMO NIGGA",
    "SUSUBOK KA PA E KITANG KITA NAMAN YUNG AGWAT SA LEVEL NATEN HAHAHAHAA",
    "BALITA KO LAGI MO RAW INUUBOS MGA ULAM NIYO SA ISANG ARAW AH? MAGTIRA KA NAMAN BABOY",
    "SAN KANA BOBO",
    "PAPALAG KAPANG TANGA KA?",
    "SUCK MO DICK KO SAGAD",
    "HAHA TANGINAKA SABAYAN HOY",
    "MAG PAKAMATAY KA NA LANG",
    "D.O KANA BOBO UNSTOPPABLE TO",
    "BAGALAN KO? HAHA",
    "WAG KA D.O HOY",
    "ANO HOY IISA KA",
    "SAY AH LAMUTAKIN MO BURAT KO",
    "SLAVE KITA BANO",
    "BALLISTIC VEST YANG ACNE MO HAHA",
    "T-TYPE KAPA BOBO WAG NA",
    "WAG KA LIHIS SAKEN HAHA",
    "WALA KA TANGA",
    "WALA KANG SILBI",
    "MASARAP BA TITE KO? HAHA",
    "IAN EUT YS",
    "PUTANGINA NAMAN SINAYANG MO ORAS KO",
    "TANDAAN MO SLAVE LANG KITA",
    "SUSUBOK KAPA SA BOSS MO?",
    "READY KA NA BA MAMATAY",
    "HAHAHAHAHAHA",
    "KEEP TRYING",
    "ANO OBESE",
    "RETARD KABA?",
    "BAGAL MO TANGA",
    "GAME NA BOBO TANGINAMO KAA",
    "WALA KA SAKIN GAGO HAHAHAHA",
    "AMBOBO MO E",
    "SISIPAIN KO MUKHA MO EH",
    "READY KA NA BA MAMATAY ",
    "SLAVE LANG KITA TANGINAMO KANG BISUGO KA ",
    "BATA KITA OKIE ",
    "BUGOK KA TANGA ",
    "SAY AH LAMUTAKIN MO BURAT KO ",
    "DILAAN MO SAPATOS KO GAGO ",
    "AKO NASA ITAAS MO ",
    "HINAHATAK LANG KITA SA KAILALIMAN ",
    "NABUGBOG KA TULOY HAHA ",
    "ISA KANG BANONG TANGA ",
    "BANO TANGINAMO LUI ON TOP ",
    "HAWAK KITA SA LEEG ",
    "KALA TALAGA NI TANGA KAYA NYA MAKIPAG SABAYAN SAKIN ",
    "INAAPAK APAKAN KO LANG PAG KA TAO MO ",
    "ISA KANG OILY OBESE ",
    "TANGINAMO KA PALAKAS KAPA SLOW TYPER ",
    "WALA KA TANGA ",
    "SHAHSAHSAH DI MAKASABAY ",
    "LUI AMO MO ",
    "D.O NA SI GAGO ",
    "SUCK MO DICK KO RN ",
    "SA SUSUNOD WAG MOKO GALITIN HA TANGINAKA ",
    "D.O NA YAN SI GAGO?? ",
    "ANO ON TOP KA? SA BURAT KO ",
    "ASPIN LANG KITA HAYUF KA ",
    "ANO NA HOY ",
    "PAKAMATAY KA NALANG PLS ",
    "SEX SLAVE LANG KITA ",
    "BISAKOL PALA TO E ",
    "TANGINAMO MAHINA ",
    "KILALANIN MO BINABANGGA MO BOBO ",
    "TANGINAMO KENGKOY BIGTI KA NALANG ",
    "SUBO MO TITE KO TANGA ",
    "GUSTO MO BA HAMPASIN KO NGALANGALA MO KANG TARANTADO KA? ",
    "ANO PAPALAG KA SA AMO MO ",
    "ASPIN LANG KITA ",
    "HOY DI KO MAKITA CHAT MO HAHA ",
    "MAG PAKAMATAY KA NA LANG ",
    "ANO HOY IISA KA ",
    "PUTANGINA NAMAN SINAYANG MO ORAS KO ",
    "TANGINAMO TAMOD KITA ",
    "WALA KA NIGGA ",
    "LULUMPUHIN KITANG GAGO KA ",
    "ISA KANG UOD NA INAAPAK APAKAN ",
    "REMEMBER MY NAME TANGA ",
    "KALA MO TATAGOS KA SAKEN HAHA ",
    "TANGINAMOKA MAG MUKMOK KA NALANG SA BAHAY NIYO ",
    "PALAG PALAG PALAG ",
    "AKO ANG BOSS AMO MO ",
    "KUNG AKO SAIYO MAG Q-QUIT TG NALANG AKO ",
    "BATUKAN LANG KITA ",
    "ISA KANG MANGMANG ",
    "HOY TABACHOY LAPAG NA ",
    "SUBO MO NA RIN TITE KO BAGAL MO E ",
    "BAWAL MATULOG DITO TANGA ",
    "WAG KANA PUMALAG ",
    "LIGO AYAW PURO SOCIAL MEDIA? ",
    "APAKA BAGAL MO ",
    "TANGINA WALA NA? ",
    "ANTANGA MO ",
    "AMBOBO MO E ",
    "TANGINAMO SAN KANA ",
    "WALA KA TANGA ",
    "WALA KA NAMAN PALa E ",
    "WAG KANA PUMALAG ",
    "SARAP MO BATUKAN ",
    "HAHAHAHA ",
    "SUCK MO DICK KO GAGO FATASS ",
    "FIGHT BACK DORK ",
    "SANAOL WACK ",
    "TANDAAN MO AKO BOSS AMO MO ",
    "HAHA LABAS MO PAGIGING RANTER MO KENGKOY ",
    "KAKATAYIN KO LANG ANG PAMILYA MO ",
    "BROKE BOI WAG KA MAG D.O ",
    "ISA KANG ANIMAL ",
    "TAHOL KA NANG TAHOL ",
    "DI KA MANANALO SAKEN KENGKOY ",
    "PAPALAG KAPANG TANGA KA? ",
    "GANITO BA PAG MALAKAS?? HAHA ",
    "WAG KA DASH OUT HANGGANG UMAGA TAYO DITO ",
    "TANGINAMO BADING ",
    "BOBO DI MO AKO KAYA LUI ON TOP ",
    "KUNG AKO SAIYO MAG Q-QUIT TG NALANG AKO ",
    "ANO TANGA KAYA MO PA? ",
    "DI MAKAISA ",
    "HOY TABA GISING NA ",
    "TANGINAMO SOBRANG BOBO ",
    "ISA KANG BOBO ",
    "BANO KA TALAGA EH AHHAH ",
    "TANGINAMOKA KALA MO MAKAKA SABAY KA SAKEN? ",
    "BOBO ",
    "HOY BOBO FLO FLOOD KITA TANGA ",
    "ISA KANG UOD NA INAAPAK APAKAN ",
    "GUSTO MO BA HAMPASIN KO NGALANGALA MO KANG TARANTADO KA? ",
    "BISAKOL PUTANGINAMO ",
    "LAMUTAKIN MO BAYAG KO ",
    "SUCK MO DICK KO RN ",
    "SABAY NAMAN SANA JAN HOY ",
    "ISA KANG BANONG TANGA ",
    "WAG KA LILIHIS HAHA ",
    "SUCK MO DICK KO GAGO FATASS ",
    "HOY TABA GISING NA ",
    "BISAKOL PUTANGINAMO ",
    "SIGBIN SPOTTED ",
    "BATA KITA OKIE ",
    "GANITO BA PAG MALAKAS?? HAHA ",
    "WALA KA PALA SA AMO MO E ",
    "LIGO AYAW PURO SOCIAL MEDIA? ",
    "ANO NA TANGINAMOKA SLAVE ",
    "ANONG BREED NG ASO KA? ",
    "HOY TANGA LUMAPAG KA HAHA ",
    "FLOODED BY LUI ",
    "GUSTO MO NG SKINCARE BROKEBOY? HAHA ",
    "TANGINAMOKA KALA MO MAKAKA SABAY KA SAKEN? ",
    "SUSUBOK KAPA SA BOSS MO? ",
    "DILAAN MO SAPATOS KO GAGO ",
    "SUMABAY KA TANGA ",
    "CUTE MO TABACHOY ",
    "TANGINAMO NIGGA ",
    "LUI ON TOP KING INA KA ",
    "SUCK MO DICK KO SAGAD ",
    "NICE TRY PILIIN MO KINAKALABAN MO TANGA ",
    "TAHOL KA NANG TAHOL ",
    "BOBO MATULOG KANA ",
    "DI KO MAKITA CHAT MO MB ",
    "BOBO DI MO AKO KAYA LUI ON TOP ",
    "WALA KA NAMAN PALa E ",
    "TANGINAMO KENGKOY BIGTI KA NALANG ",
    "KAYA MO BA AKO SABAYAN? ",
    "TANDAAN MO AKO BOSS AMO MO ",
    "D.O NA YAN SI GAGO?? ",
    "TANGINAMO SASABAY KAPA ",
    "DI MAKAISA ",
    "TANGINAMO TAMOD KITA ",
    "NICE TRY PILIIN MO KINAKALABAN MO TANGA ",
    "WAG KA D.O HOY ",
    "GUSTO MO GAWIN KITANG SEX SLAVE ",
    "D.O NA SI GAGO ",
    "SARAP MO BATUKAN ",
    "PAPALAG KAPANG TANGA KA? ",
    "AKO NASA ITAAS MO ",
    "NAPAKA BAGAL MO MAG TYPE ",
    "TANGINAMO SAN KANA ",
    "LUI AMO MO ",
    "ANONG BREED NG ASO KA? ",
    "FIGHT BACK DORK ",
    "WALA KA NIGGA ",
    "BAWAL MATULOG DITO TANGA ",
    "TANGINAMOKA MAG MUKMOK KA NALANG SA BAHAY NIYO ",
    "TANGINA WALA NA? ",
    "HOY TANGA LUMAPAG KA HAHA ",
    "TANGINAMO KA PALAKAS KAPA SLOW TYPER ",
    "HOY BOBO FLO FLOOD KITA TANGA ",
    "WALA KA EA MO SAKIN NA ",
    "BATUKAN LANG KITA ",
    "LUI ON TOP BOBO ",
    "KILALANIN MO BINABANGGA MO BOBO ",
    "TANDAAN MO AKO BOSS AMO MO ",
    "KAKATAYIN KO LANG ANG PAMILYA MO ",
    "D.O KANA TANGINAMO SLOW TYPER ",
    "ISA KANG ABNORMAL NA TAO",
    "REMEMBER MY NAME TANGA",
    "WALA KA EA MO SAKIN NA",
    "WALA KA NAMAN PALA E",
    "AKO ANG BOSS AMO MO",
    "LESSON AND LEARN WAG MAGING TANGA",
    "PAG KAKANTUTIN KITA 24/7",
    "SAN KANA BOBO",
    "SUMABAY KA TANGA",
    "HINAHATAK LANG KITA SA KAILALIMAN",
    "BOBO KA HAHA DI KA TATAGOS",
    "LESSON AND LEARN WAG MAGING TANGA",
    "TANGINAMONG MALNOURISHED KA"
];

function boldText(text) {
    return `**${text}**`;
}

function strikethrough(text) {
    return `~~${text}~~`;
}

async function createMention(displayText, target, client) {
    try {
        const cleanTarget = target.startsWith('@') ? target.slice(1) : target;
        
        // Try to get the entity
        const result = await client.invoke(
            new Api.contacts.ResolveUsername({
                username: cleanTarget
            })
        );
        
        const user = result.users[0];
        if (user && user.username) {
            return `[${displayText}](tg://user?id=${user.id})`;
        } else {
            const name = user.firstName || `user${user.id}`;
            return `[${displayText}](tg://user?id=${user.id})`;
        }
    } catch (e) {
        console.error(`Error creating mention for ${target}:`, e);
        const cleanTarget = target.startsWith('@') ? target : `@${target}`;
        return cleanTarget;
    }
}

function getRandomEmoji() {
    const emojis = ["😈😂👌🤣"];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

async function main() {
    const stringSession = new StringSession(process.env.SESSION_STRING || '');
    
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    
    await client.start({
        phoneNumber: async () => process.env.PHONE_NUMBER,
        password: async () => process.env.TG_PASSWORD,
        phoneCode: async () => process.env.TG_CODE,
        onError: (err) => console.log(err),
    });
    
    // Save session string to environment variable for future use
    if (!process.env.SESSION_STRING) {
        process.env.SESSION_STRING = client.session.save();
    }
    
    console.log(`
>> SELF-BOT READY <<
Commands:
✅ .ar [word] [user] - Fast styled spam
✅ .sar [word] [user] - Random burst spam
✅ .asr [word] [user] - Auto Slow Rant (5s)
✅ .dar [word] [user1] [user2] - Dual target
✅ .sm [word] [user] - Single mention
✅ .am [user] - Auto-mock (reply to all their messages)
✅ .ae [user] - Auto-reply (reply only when mentioned)
✅ .stop - Emergency stop
`);

    // Command handler
    client.addEventHandler(async (event) => {
        try {
            const message = event.message;
            if (!message.out) return;
            
            const msg = message.message;
            if (!msg || !msg.startsWith('.')) return;
            
            // .menu command
            if (msg === '.menu') {
                await message.delete({ revoke: true });
                const menuText = `
🤖 LUI SELFBOT COMMANDS 🤖

.ar [word] [user] - Fast styled spam
.sar [word] [user] - Random burst spam
.dar [word] [user1] [user2] - Dual target
.sm [word] [user] - Single mention
.asr [word] [user] - Auto Slow Rant (5s)
.am [user] - Auto-mock (reply to their messages)
.ae [user] - Auto-reply (reply when mentioned)
.stop - Stop all functions
`;
                await client.sendMessage(message.chatId, { message: menuText });
            }
            
            // .ar command - Auto Rant
            else if (msg.startsWith('.ar ')) {
                await message.delete({ revoke: true });
                const parts = msg.split(' ').filter(part => part !== '');
                if (parts.length >= 3) {
                    const mentionWord = parts[1];
                    const target = parts[2];
                    autoRantTarget = await createMention(mentionWord, target, client);
                    spamming = true;
                    
                    while (spamming) {
                        const insult = boldText(VZKOU_INSULTS[Math.floor(Math.random() * VZKOU_INSULTS.length)]);
                        await client.sendMessage(message.chatId, {
                            message: `${strikethrough(insult)} ${autoRantTarget} ${getRandomEmoji()}`,
                            linkPreview: false
                        });
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
            }
            
            // .sar command - Spam Auto Rant
            else if (msg.startsWith('.sar ')) {
                await message.delete({ revoke: true });
                const parts = msg.split(' ').filter(part => part !== '');
                if (parts.length >= 3) {
                    const mentionWord = parts[1];
                    const target = parts[2];
                    autoRantTarget = await createMention(mentionWord, target, client);
                    spamming = true;
                    
                    while (spamming) {
                        const count = Math.floor(Math.random() * 10) + 1;
                        for (let i = 0; i < count; i++) {
                            const insult = boldText(VZKOU_INSULTS[Math.floor(Math.random() * VZKOU_INSULTS.length)]);
                            await client.sendMessage(message.chatId, {
                                message: `${strikethrough(insult)} ${autoRantTarget} ${getRandomEmoji()}`,
                                linkPreview: false
                            });
                        }
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
            
            // .asr command - Auto Slow Rant
            else if (msg.startsWith('.asr ')) {
                await message.delete({ revoke: true });
                asrEnabled = false;
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const parts = msg.split(' ').filter(part => part !== '');
                if (parts.length >= 3) {
                    const mentionWord = parts[1];
                    const target = parts[2];
                    autoRantTarget = await createMention(mentionWord, target, client);
                    asrEnabled = true;
                    
                    while (asrEnabled) {
                        const insult = boldText(VZKOU_INSULTS[Math.floor(Math.random() * VZKOU_INSULTS.length)]);
                        await client.sendMessage(message.chatId, {
                            message: `${strikethrough(insult)} ${autoRantTarget} ${getRandomEmoji()}`,
                            linkPreview: false
                        });
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }
            
            // .dar command - Dual Auto Rant
            else if (msg.startsWith('.dar ')) {
                await message.delete({ revoke: true });
                spamming = false;
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                const parts = msg.split(' ').filter(part => part !== '');
                if (parts.length >= 4) {
                    const mentionWord = parts[1];
                    const target1 = parts[2];
                    const target2 = parts[3];
                    const mention1 = await createMention(mentionWord, target1, client);
                    const mention2 = await createMention(mentionWord, target2, client);
                    dualTargets = [mention1, mention2];
                    spamming = true;
                    
                    while (spamming) {
                        const insults = Array(4).fill().map(() => 
                            boldText(VZKOU_INSULTS[Math.floor(Math.random() * VZKOU_INSULTS.length)]));
                        
                        await client.sendMessage(message.chatId, { 
                            message: `${strikethrough(insults[0])} ${dualTargets[0]} ${getRandomEmoji()}` 
                        });
                        await client.sendMessage(message.chatId, { 
                            message: `${strikethrough(insults[1])} ${dualTargets[1]} ${getRandomEmoji()}` 
                        });
                        await client.sendMessage(message.chatId, { 
                            message: `${strikethrough(insults[2])} ${dualTargets[0]} ${getRandomEmoji()}` 
                        });
                        await client.sendMessage(message.chatId, { 
                            message: `${strikethrough(insults[3])} ${dualTargets[1]} ${getRandomEmoji()}` 
                        });
                        
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }
                }
            }
            
            // .sm command - Single Mention
            else if (msg.startsWith('.sm ')) {
                await message.delete({ revoke: true });
                const parts = msg.split(' ').filter(part => part !== '');
                if (parts.length >= 3) {
                    const mentionWord = parts[1];
                    const target = parts[2];
                    const mention = await createMention(mentionWord, target, client);
                    const insult = boldText(VZKOU_INSULTS[Math.floor(Math.random() * VZKOU_INSULTS.length)]);
                    await client.sendMessage(message.chatId, {
                        message: `${strikethrough(insult)} ${mention} ${getRandomEmoji()}`,
                        linkPreview: false
                    });
                }
            }
            
            // .am command - Auto Mock (reply to all their messages)
            else if (msg.startsWith('.am ')) {
                await message.delete({ revoke: true });
                const parts = msg.split(' ').filter(part => part !== '');
                if (parts.length > 1) {
                    if (parts[1].toLowerCase() === 'stop') {
                        autoMockEnabled = false;
                        autoMockTarget = null;
                        const status = await client.sendMessage(message.chatId, { message: "Auto-mock OFF" });
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        await status.delete({ revoke: true });
                    } else {
                        let target = parts[1].trim();
                        if (target.startsWith('@')) {
                            target = target.slice(1);
                        }
                        autoMockTarget = target.toLowerCase();
                        autoMockEnabled = true;
                        const status = await client.sendMessage(message.chatId, { 
                            message: `Auto-mock ON for @${autoMockTarget} (will reply to all their messages)` 
                        });
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        await status.delete({ revoke: true });
                    }
                }
            }
            
            // .ae command - Auto Reply (only when mentioned)
            else if (msg.startsWith('.ae ')) {
                await message.delete({ revoke: true });
                const parts = msg.split(' ').filter(part => part !== '');
                if (parts.length > 1) {
                    if (parts[1].toLowerCase() === 'stop') {
                        autoReplyEnabled = false;
                        autoReplyTarget = null;
                        const status = await client.sendMessage(message.chatId, { message: "Auto-reply OFF" });
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        await status.delete({ revoke: true });
                    } else {
                        let target = parts[1].trim();
                        if (target.startsWith('@')) {
                            target = target.slice(1);
                        }
                        autoReplyTarget = target.toLowerCase();
                        autoReplyEnabled = true;
                        const status = await client.sendMessage(message.chatId, { 
                            message: `Auto-reply ON for @${autoReplyTarget} (will reply only when mentioned)` 
                        });
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        await status.delete({ revoke: true });
                    }
                }
            }
            
            // .stop command
            else if (msg === '.stop') {
                await message.delete({ revoke: true });
                spamming = false;
                asrEnabled = false;
                autoRantTarget = null;
                autoMockTarget = null;
                autoMockEnabled = false;
                autoReplyTarget = null;
                autoReplyEnabled = false;
                dualTargets = [];
                await client.sendMessage(message.chatId, { message: "ALL FUNCTIONS STOPPED" });
            }
            
        } catch (e) {
            console.error('Command error:', e);
        }
    }, new NewMessage({ outgoing: true }));
    
    // Message handler for auto-reply and auto-mock
    client.addEventHandler(async (event) => {
        try {
            const message = event.message;
            if (message.out) return;
            
            // Auto-mock handler
            if (autoMockEnabled && autoMockTarget) {
                const sender = await message.getSender();
                const username = (sender.username || '').toLowerCase();
                const firstName = (sender.firstName || '').toLowerCase();
                const userId = String(sender.id || '');
                
                if (username === autoMockTarget || firstName === autoMockTarget || userId === autoMockTarget) {
                    const insult = boldText(VZKOU_INSULTS[Math.floor(Math.random() * VZKOU_INSULTS.length)]);
                    const mention = await createMention(autoMockTarget, autoMockTarget, client);
                    await message.reply({ message: `${strikethrough(insult)} ${mention} ${getRandomEmoji()}` });
                }
            }
            
            // Auto-reply handler
            if (autoReplyEnabled && autoReplyTarget) {
                const sender = await message.getSender();
                const messageText = message.message || '';
                
                if (messageText.toLowerCase().includes(`@${autoReplyTarget}`) || 
                    messageText.toLowerCase().includes(autoReplyTarget)) {
                    
                    const username = (sender.username || '').toLowerCase();
                    const firstName = (sender.firstName || '').toLowerCase();
                    const userId = String(sender.id || '');
                    
                    if (username === autoReplyTarget || firstName === autoReplyTarget || userId === autoReplyTarget) {
                        const insult = boldText(VZKOU_INSULTS[Math.floor(Math.random() * VZKOU_INSULTS.length)]);
                        const mention = await createMention(autoReplyTarget, autoReplyTarget, client);
                        await message.reply({ message: `${strikethrough(insult)} ${mention} ${getRandomEmoji()}` });
                    }
                }
            }
        } catch (e) {
            console.error('Message handler error:', e);
        }
    }, new NewMessage({}));
}

// Keep alive server
function keepAlive() {
    const server = createServer((req, res) => {
        res.writeHead(200);
        res.end('Bot is alive');
    });
    
    server.listen(process.env.PORT || 3000, () => {
        console.log('Keep-alive server is running');
    });
    
    return server;
}

// Vercel serverless function handler
module.exports = async (req, res) => {
    // Start the keepAlive mechanism
    keepAlive();
    
    // Initialize the bot
    try {
        await main();
        res.status(200).send('Bot is running');
    } catch (error) {
        console.error('Error starting bot:', error);
        res.status(500).send('Error starting bot');
    }
};

// For local testing
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        keepAlive();
        main().catch(console.error);
    });
}