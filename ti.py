import os
import asyncio
import random
import traceback
from telethon import TelegramClient, events, functions
from keep_alive import keep_alive

# Configuration
api_id = 23209699  # Your API ID
api_hash = '914c6b8aa854364d0f0a7885f53bf595'  # Your API HASH
session_name = 'luiselfbot'
SESSION_FILE = f'{session_name}.session'

# Initialize client
client = TelegramClient(session_name, api_id, api_hash)

# Global variables
spamming = False
auto_rant_target = None
auto_mock_target = None
auto_mock_enabled = False
auto_reply_target = None
auto_reply_enabled = False
asr_enabled = False
dual_targets = []

# Insult database (unchanged from your original)
VZKOU_INSULTS = [
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
    "WALA KA NAMAN PALA E ",
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
]

def bold_text(text):
    return f"**{text}**"

def strikethrough(text):
    return f"~~{text}~~"

async def create_mention(display_text, target):
    try:
        clean_target = target[1:] if target.startswith('@') else target
        user = await client.get_entity(clean_target)
        
        # If user has a username, use it, otherwise use their ID
        if hasattr(user, 'username') and user.username:
            return f"[{display_text}](tg://user?id={user.id})"
        else:
            # For users without username, use their first name or ID
            name = getattr(user, 'first_name', f'user{user.id}')
            return f"[{display_text}](tg://user?id={user.id})"
    except Exception as e:
        print(f"Error creating mention for {target}: {e}")
        # Fallback: just return the display text with @
        return f"@{clean_target}" if not target.startswith('@') else target

def get_random_emoji():
    return random.choice(["😈😂👌🤣✌️"])

# Command handlers
@client.on(events.NewMessage(outgoing=True, pattern=r'^\.\w+'))
async def command_handler(event):
    global spamming, auto_rant_target, auto_mock_target, auto_mock_enabled, auto_reply_target, auto_reply_enabled, asr_enabled, dual_targets
    
    try:
        msg = event.message.message.strip()
        
        # .menu command
        if msg == '.menu':
            await event.delete()
            menu_text = """
🤖 LUI SELFBOT COMMANDS 🤖

.ar [word] [user] - Fast styled spam
.sar [word] [user] - Random burst spam
.dar [word] [user1] [user2] - Dual target
.sm [word] [user] - Single mention
.asr [word] [user] - Auto Slow Rant (5s)
.am [user] - Auto-mock (reply to their messages)
.ae [user] - Auto-reply (reply when mentioned)
.stop - Stop all functions
"""
            await event.respond(menu_text)
        
        # .ar command - Auto Rant
        elif msg.startswith('.ar '):
            await event.delete()
            parts = msg.split(maxsplit=2)
            if len(parts) >= 3:
                mention_word, target = parts[1], parts[2]
                auto_rant_target = await create_mention(mention_word, target)
                spamming = True
                
                while spamming:
                    insult = bold_text(random.choice(VZKOU_INSULTS))
                    await client.send_message(
                        event.chat_id,
                        f"{strikethrough(insult)} {auto_rant_target} {get_random_emoji()}",
                        link_preview=False
                    )
                    await asyncio.sleep(0.1)
        
        # .sar command - Spam Auto Rant
        elif msg.startswith('.sar '):
            await event.delete()
            parts = msg.split(maxsplit=2)
            if len(parts) >= 3:
                mention_word, target = parts[1], parts[2]
                auto_rant_target = await create_mention(mention_word, target)
                spamming = True
                
                while spamming:
                    for _ in range(random.randint(1, 10)):
                        insult = bold_text(random.choice(VZKOU_INSULTS))
                        await client.send_message(
                            event.chat_id,
                            f"{strikethrough(insult)} {auto_rant_target} {get_random_emoji()}",
                            link_preview=False
                        )
                    await asyncio.sleep(1)
        
        # .asr command - Auto Slow Rant
        elif msg.startswith('.asr '):
            await event.delete()
            asr_enabled = False
            await asyncio.sleep(0.1)
            
            parts = msg.split(maxsplit=2)
            if len(parts) >= 3:
                mention_word, target = parts[1], parts[2]
                auto_rant_target = await create_mention(mention_word, target)
                asr_enabled = True
                
                while asr_enabled:
                    insult = bold_text(random.choice(VZKOU_INSULTS))
                    await client.send_message(
                        event.chat_id, 
                        f"{strikethrough(insult)} {auto_rant_target} {get_random_emoji()}",
                        link_preview=False
                    )
                    await asyncio.sleep(2)

        # .dar command - Dual Auto Rant
        elif msg.startswith('.dar '):
            await event.delete()
            spamming = False
            await asyncio.sleep(3)
            
            parts = msg.split(maxsplit=3)
            if len(parts) >= 4:
                mention_word, target1, target2 = parts[1], parts[2], parts[3]
                mention1 = await create_mention(mention_word, target1)
                mention2 = await create_mention(mention_word, target2)
                dual_targets = [mention1, mention2]
                spamming = True
                
                while spamming:
                    insults = [bold_text(random.choice(VZKOU_INSULTS)) for _ in range(4)]
                    await client.send_message(event.chat_id, f"{strikethrough(insults[0])} {dual_targets[0]} {get_random_emoji()}")
                    await client.send_message(event.chat_id, f"{strikethrough(insults[1])} {dual_targets[1]} {get_random_emoji()}")
                    await client.send_message(event.chat_id, f"{strikethrough(insults[2])} {dual_targets[0]} {get_random_emoji()}")
                    await client.send_message(event.chat_id, f"{strikethrough(insults[3])} {dual_targets[1]} {get_random_emoji()}")
                    await asyncio.sleep(3)

        # .sm command - Single Mention
        elif msg.startswith('.sm '):
            await event.delete()
            parts = msg.split(maxsplit=2)
            if len(parts) >= 3:
                mention_word, target = parts[1], parts[2]
                mention = await create_mention(mention_word, target)
                insult = bold_text(random.choice(VZKOU_INSULTS))
                await client.send_message(
                    event.chat_id,
                    f"{strikethrough(insult)} {mention} {get_random_emoji()}",
                    link_preview=False
                )

        # .am command - Auto Mock (reply to all their messages)
        elif msg.startswith('.am '):
            await event.delete()
            parts = msg.split(maxsplit=1)
            if len(parts) > 1:
                if parts[1].lower() == 'stop':
                    auto_mock_enabled = False
                    auto_mock_target = None
                    status = await event.respond("Auto-mock OFF")
                else:
                    target = parts[1].strip()
                    if target.startswith('@'):
                        target = target[1:]
                    auto_mock_target = target.lower()
                    auto_mock_enabled = True
                    status = await event.respond(f"Auto-mock ON for @{auto_mock_target} (will reply to all their messages)")
                await asyncio.sleep(3)
                await status.delete()

        # .ae command - Auto Reply (only when mentioned)
        elif msg.startswith('.ae '):
            await event.delete()
            parts = msg.split(maxsplit=1)
            if len(parts) > 1:
                if parts[1].lower() == 'stop':
                    auto_reply_enabled = False
                    auto_reply_target = None
                    status = await event.respond("Auto-reply OFF")
                else:
                    target = parts[1].strip()
                    if target.startswith('@'):
                        target = target[1:]
                    auto_reply_target = target.lower()
                    auto_reply_enabled = True
                    status = await event.respond(f"Auto-reply ON for @{auto_reply_target} (will reply only when mentioned)")
                await asyncio.sleep(3)
                await status.delete()

        # .stop command
        elif msg == '.stop':
            await event.delete()
            spamming = False
            asr_enabled = False
            auto_rant_target = None
            auto_mock_target = None
            auto_mock_enabled = False
            auto_reply_target = None
            auto_reply_enabled = False
            dual_targets = []
            await event.respond("ALL FUNCTIONS STOPPED")

    except Exception as e:
        print(f"Command error: {traceback.format_exc()}")

# Event handlers
@client.on(events.NewMessage())
async def message_handler(event):
    # Skip if the message is from ourselves
    if event.out:
        return
        
    # Auto-mock handler (reply to ALL messages from target)
    if auto_mock_enabled and auto_mock_target:
        try:
            sender = await event.get_sender()
            username = getattr(sender, 'username', '').lower() if hasattr(sender, 'username') else ''
            first_name = getattr(sender, 'first_name', '').lower() if hasattr(sender, 'first_name') else ''
            user_id = str(getattr(sender, 'id', ''))
            
            if (username == auto_mock_target or 
                first_name == auto_mock_target or
                user_id == auto_mock_target):
                
                insult = bold_text(random.choice(VZKOU_INSULTS))
                mention = await create_mention(auto_mock_target, auto_mock_target)
                await event.reply(f"{strikethrough(insult)} {mention} {get_random_emoji()}")
        except Exception as e:
            print(f"Auto-mock error: {e}")

    # Auto-reply handler (only reply when mentioned)
    if auto_reply_enabled and auto_reply_target:
        try:
            sender = await event.get_sender()
            message_text = event.message.text or event.message.message or ""
            
            # Check if we're mentioned in the message
            if (f"@{auto_reply_target}" in message_text.lower() or 
                auto_reply_target in message_text.lower()):
                
                username = getattr(sender, 'username', '').lower() if hasattr(sender, 'username') else ''
                first_name = getattr(sender, 'first_name', '').lower() if hasattr(sender, 'first_name') else ''
                user_id = str(getattr(sender, 'id', ''))
                
                if (username == auto_reply_target or 
                    first_name == auto_reply_target or
                    user_id == auto_reply_target):
                    
                    insult = bold_text(random.choice(VZKOU_INSULTS))
                    mention = await create_mention(auto_reply_target, auto_reply_target)
                    await event.reply(f"{strikethrough(insult)} {mention} {get_random_emoji()}")
        except Exception as e:
            print(f"Auto-reply error: {e}")

# Main function
async def main():
    # Initialize session
    if not os.path.exists(SESSION_FILE):
        with open(SESSION_FILE, 'w') as f:
            f.write('')

    await client.start()
    print("""
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
""")

keep_alive()

    await client.run_until_disconnected()

if __name__ == '__main__':
    asyncio.run(main())