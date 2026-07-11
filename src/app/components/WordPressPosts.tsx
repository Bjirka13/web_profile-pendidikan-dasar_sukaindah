import { useEffect, useState } from "react";

interface WordPressPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  link: string;
  date: string;
}

const baseUrl = import.meta.env.VITE_WORDPRESS_URL?.replace(/\/$/, "");

export function WordPressPosts() {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!baseUrl) {
      setError("Set VITE_WORDPRESS_URL terlebih dahulu.");
      return;
    }

    const controller = new AbortController();

    async function loadPosts() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts?per_page=3`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Gagal mengambil konten: ${response.status}`);
        }

        const data = (await response.json()) as WordPressPost[];
        setPosts(data);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadPosts();

    return () => controller.abort();
  }, []);

  if (!baseUrl) {
    return null;
  }

  return (
    <section className="bg-muted/40 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-block bg-accent/20 text-foreground text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border border-accent/30">
            Konten WordPress
          </span>
          <h2 className="mt-4 text-foreground font-extrabold text-2xl md:text-3xl">
            Artikel terbaru dari WordPress
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Konten ini bisa diedit lewat admin WordPress dan langsung tampil di website Vercel.
          </p>
        </div>

        {loading && <p className="text-center text-muted-foreground">Memuat konten...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && posts.length === 0 && (
          <p className="text-center text-muted-foreground">Belum ada postingan.</p>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {new Date(post.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-foreground">
                {post.title.rendered.replace(/<[^>]+>/g, "")}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-4">
                {post.excerpt.rendered.replace(/<[^>]+>/g, "").replace(/&[^;]+;/g, "")}
              </p>
              <a
                href={post.link}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center text-sm font-semibold text-primary"
              >
                Baca selengkapnya →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
