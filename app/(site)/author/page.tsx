export const metadata = {
    title: "From Author • Sakura",
};

export default function AuthorPage() {

    return (
        <main className="center-wrap">
            <section className="hero-card hero-card-wide">
                <h1 className="title-sm">
                    From <span>Author</span>
                </h1>

                {/* Sinhala (quoted) */}
                <p className="subtitle inria-sans-regular-italic subtitle-sinhala" style={{ maxWidth: "auto" }}>
                    “සකුරා යනු සාහිත්‍ය නිර්මාණයකින් එපිට සීමාවක සිට නිර්මාණය වූ යතාර්ථයකි. එය එක් කාව්‍ය නිර්මාණයකින් හෝ එක් කෘතියකින් කිසිසේත්ම අවසන් නොවේ. සෑම මොහොතකම හැකි උපරිම ලෙස යතාර්ථය ඒත්තු ගැන්වීමට ගත් ප්‍රයත්නයක් ලෙස සකුරා හැඳින්විය හැකිය. යතාර්ථයට අවසානයක් නොමැත. සදාකාලික පැවැත්මකට උරුමකම් කියන යතාර්ථයෙන් ඉතාමත් සුළු ප්‍රමාණයක් සකුරා පළමු පරිච්ඡේදය තුළින් සමීප කරවීමට උත්සහ කරන ලදි. සමුරායිගේ ජීවිතයේ එක් පරිච්ඡේදයක් මෙලෙසින් අවසන් වුවද එම අවසානයම නව පරිච්ඡේදයකට මුල පුරා ඇත. යතාර්ථයේ මීළඟ පරිච්ඡේදය සමගින් හමුවන තුරු සකුරාවට පෙම් බැඳි යතාර්ථයේ සාක්ෂ්‍යකරුවනි, බොහොම ස්තුතියි”
                </p>

                {/* English (quoted) */}
                <p className="subtitle" style={{ marginTop: 20, marginBottom: 0 }}>
                    “Sakura is a reality created from a boundary beyond a literary creation. It does not end with one poetic creation or one work. Sakura can be described as an attempt to convince reality as much as possible at every moment. Reality has no end. Sakura tried to bring a very small amount of the reality that inherits an eternal existence closer through the first chapter. Although one chapter of the samurai's life ends like this, that same end is the beginning of a new chapter. Until we meet with the next chapter of reality, thank you very much, witnesses of reality who fell in love with Sakura”
                </p>
            </section>
        </main>
    );
}
