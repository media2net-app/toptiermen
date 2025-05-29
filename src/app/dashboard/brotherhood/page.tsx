"use client";
import ClientLayout from '../../components/ClientLayout';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

const filters = ["Populair", "Nieuw", "Progressie-updates", "Challenges"];
const posts = [
  {
    id: 1,
    user: {
      name: "Rick",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      motto: "Train. Lead. Conquer."
    },
    type: "progress",
    content: "Vandaag 10.000 stappen gezet en 30 min gelezen!",
    image: null,
    likes: 12,
    comments: [
      { user: "Teun", text: "Topper!" },
      { user: "Jeroen", text: "Inspirerend!" }
    ],
    time: "2u geleden"
  },
  {
    id: 2,
    user: {
      name: "Sven",
      avatar: "https://randomuser.me/api/portraits/men/65.jpg",
      motto: "No excuses."
    },
    type: "challenge",
    content: "Push-up challenge afgerond 💪",
    image: null,
    likes: 8,
    comments: [],
    time: "1u geleden"
  },
  {
    id: 3,
    user: {
      name: "Rick",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      motto: "Train. Lead. Conquer."
    },
    type: "vraag",
    content: "Wie heeft tips voor meal-prep?",
    image: null,
    likes: 3,
    comments: [
      { user: "Sven", text: "Check mijn post van vorige week!" }
    ],
    time: "10m geleden"
  }
];

const leaderboard = [
  { name: "Rick", score: 120, avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Sven", score: 110, avatar: "https://randomuser.me/api/portraits/men/65.jpg" },
  { name: "Teun", score: 105, avatar: "https://randomuser.me/api/portraits/men/12.jpg" },
];

export default function Brotherhood() {
  const [selectedFilter, setSelectedFilter] = useState("Populair");
  const [likeCounts, setLikeCounts] = useState(posts.map(p => p.likes));

  const filteredPosts = posts.filter(post => {
    if (selectedFilter === "Populair") return true;
    if (selectedFilter === "Nieuw") return true;
    if (selectedFilter === "Progressie-updates") return post.type === "progress";
    if (selectedFilter === "Challenges") return post.type === "challenge";
    return true;
  });

  const handleLike = (idx: number) => {
    setLikeCounts(likeCounts.map((c, i) => (i === idx ? c + 1 : c)));
  };

  return (
    <ClientLayout>
      <div className="py-8 px-4 md:px-12 flex flex-col gap-12">
        {/* Top 3 blokken naast elkaar */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          {/* Mijn Profiel */}
          <section className="flex-1 flex flex-col justify-start">
            <h2 className="text-2xl font-bold text-white mb-4">Mijn Profiel</h2>
            <Link href="/dashboard/brotherhood/profiel" className="flex items-center gap-6 bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 hover:scale-105 transition-transform w-full min-h-[130px] h-full">
              <Image src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" className="w-16 h-16 rounded-full border-2 border-[#635985] self-start" width={64} height={64} />
              <div className="flex-1 flex flex-col justify-start">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-white">Rick</span>
                  <span className="text-xs text-[#A3AED6] italic">&quot;Train. Lead. Conquer.&quot;</span>
                </div>
                <div className="w-full h-2 bg-[#393053]/40 rounded-full mb-2">
                  <div className="h-2 bg-gradient-to-r from-[#635985] to-[#443C68] rounded-full" style={{ width: '68%' }}></div>
                </div>
                <div className="flex gap-4 text-xs text-[#A3AED6]">
                  <span>Badges: 7</span>
                  <span>Challenges: 3</span>
                  <span>Dagen actief: 42</span>
                  <span>Posts: 15</span>
                </div>
                <div className="mt-2 text-xs text-[#A3AED6]">AI-Coach: Discipline (toonbaar)</div>
                <div className="mt-1 text-xs text-[#A3AED6]">Mijn routines: 06:00 opstaan, 10.000 stappen, 30 min lezen</div>
              </div>
            </Link>
          </section>

          {/* Live Leaderboard */}
          <section className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-4">Live Leaderboard</h2>
            <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 w-full h-full min-h-[260px] flex flex-col justify-between">
              <div>
                <div className="flex gap-6 mb-4">
                  {leaderboard.map((user, i) => (
                    <div key={user.name} className="flex flex-col items-center">
                      <Image src={user.avatar} alt="avatar" className="w-12 h-12 rounded-full border-2 border-[#635985] mb-1" width={48} height={48} />
                      <span className="text-white font-semibold">{user.name}</span>
                      <span className="text-[#A3AED6] text-xs">{i === 0 ? 'Top groeier van de maand' : `Score: ${user.score}`}</span>
                    </div>
                  ))}
                </div>
                <span className="text-xs text-[#A3AED6] mt-2 block">Weekscore: 120</span>
              </div>
              <button className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#635985] to-[#443C68] text-white font-semibold shadow hover:from-[#443C68] hover:to-[#635985] transition-all w-full">Buddy-verzoek</button>
            </div>
          </section>

          {/* Join a Squad */}
          <section className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-4">Join a Squad</h2>
            <div className="bg-gradient-to-r from-[#443C68] to-[#635985] rounded-2xl p-6 shadow-xl border border-[#393053]/40 w-full h-full min-h-[260px] flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Word lid van een Squad</h3>
                <p className="text-[#A3AED6] mb-2">Sluit je aan bij een Squad (subgroep op niveau of regio) en krijg toegang tot een groepschat, tribe en accountability-buddy systeem.</p>
                <ul className="list-disc list-inside text-[#A3AED6] text-sm mb-2">
                  <li>Eigen groepschat of updates</li>
                  <li>Kleine tribe binnen de Brotherhood</li>
                  <li>Accountability-buddy systeem</li>
                </ul>
              </div>
              <button className="mt-4 px-6 py-3 rounded-xl bg-[#232042] text-white font-semibold shadow hover:bg-[#393053] transition-all w-full">Sluit je aan bij een Squad</button>
            </div>
          </section>
        </div>

        {/* Community Wall */}
        <section>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Community Wall</h1>
          <p className="text-[#A3AED6] text-lg mb-4">Updates van leden: overwinningen, challenges, reflecties & meer</p>
          <div className="flex gap-3 mb-6">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm ${selectedFilter === f ? 'bg-gradient-to-r from-[#443C68] to-[#635985] text-white' : 'bg-[#232042] text-[#A3AED6]'} transition`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-6">
            {filteredPosts.map((post, idx) => (
              <div key={post.id} className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40">
                <div className="flex items-center gap-4 mb-2">
                  <Image src={post.user.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-[#393053]" width={40} height={40} />
                  <div>
                    <span className="font-semibold text-white">{post.user.name}</span>
                    <span className="ml-2 text-xs text-[#A3AED6] italic">&quot;{post.user.motto}&quot;</span>
                  </div>
                  <span className="ml-auto text-xs text-[#A3AED6]">{post.time}</span>
                </div>
                <div className="mb-2 text-[#A3AED6]">{post.content}</div>
                {post.image && <Image src={post.image} alt="post" className="rounded-xl mb-2" width={320} height={240} />}
                <div className="flex items-center gap-4 mt-2">
                  <button onClick={() => handleLike(idx)} className="text-[#A3AED6] hover:text-[#f0a14f] font-bold">♥ {likeCounts[idx]}</button>
                  <span className="text-xs text-[#A3AED6]">{post.comments.length} reacties</span>
                  <Link href="/dashboard/brotherhood/profiel" className="ml-auto text-xs text-[#A3AED6] underline hover:text-white">Bekijk profiel</Link>
                </div>
                {post.comments.length > 0 && (
                  <div className="mt-2 ml-4 border-l-2 border-[#393053] pl-4">
                    {post.comments.map((c, i) => (
                      <div key={i} className="text-xs text-[#A3AED6] mb-1"><span className="font-semibold">{c.user}:</span> {c.text}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </ClientLayout>
  );
} 