import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/lms/AppShell";
import { Award, Download, Share2, ShieldCheck, Eye, X, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { api, Certificate, UserProfile } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/certificates")({
  head: () => ({ meta: [{ title: "Certificates · Neuron LMS" }] }),
  component: Certificates,
});

function Certificates() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    Promise.all([api.getCertificates(), api.getUserProfile()])
      .then(([certData, userData]) => {
        setCerts(certData);
        setUser(userData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching certificates page data:", err);
        setLoading(false);
      });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    toast.success("Verifiable credential link copied to clipboard!");
  };

  const handleDownload = () => {
    if (!selectedCert) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0c0f16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createRadialGradient(800, 300, 100, 800, 300, 700);
    gradient.addColorStop(0, "rgba(142, 230, 48, 0.08)");
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#8ee630";
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.strokeStyle = "rgba(142, 230, 48, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);

    ctx.strokeStyle = "rgba(142, 230, 48, 0.02)";
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(800, 600, 250, 0, Math.PI * 2);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#8ee630";
    ctx.font = "bold 20px 'Courier New', monospace";
    ctx.fillText("NEURON ACADEMY REGISTRY", 800, 150);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 64px system-ui, -apple-system, sans-serif";
    ctx.fillText("DIPLOMA OF LEARNING", 800, 240);

    const divGrad = ctx.createLinearGradient(600, 0, 1000, 0);
    divGrad.addColorStop(0, "transparent");
    divGrad.addColorStop(0.5, "#8ee630");
    divGrad.addColorStop(1, "transparent");
    ctx.fillStyle = divGrad;
    ctx.fillRect(600, 290, 400, 3);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "italic 24px Georgia, serif";
    ctx.fillText("This official document certifies that", 800, 370);

    const name = selectedCert.recipientName || user?.name || "Student";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px system-ui, -apple-system, sans-serif";
    ctx.fillText(name, 800, 470);

    ctx.fillStyle = "rgba(142, 230, 48, 0.7)";
    ctx.fillRect(800 - 200, 525, 400, 4);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "italic 24px Georgia, serif";
    ctx.fillText("has successfully completed the adaptive curriculum for", 800, 590);

    const title = selectedCert.courseName || selectedCert.title;
    ctx.fillStyle = "#8ee630";
    ctx.font = "bold 44px system-ui, -apple-system, sans-serif";
    ctx.fillText(title, 800, 680);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
    ctx.fillText(`With a graded achievement of ${selectedCert.grade}`, 800, 770);

    ctx.textAlign = "left";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 16px 'Courier New', monospace";
    ctx.fillText("COURSE DURATION", 200, 920);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
    const duration = `${selectedCert.startDate || "Jun 01, 2026"} to ${selectedCert.endDate || selectedCert.date}`;
    ctx.fillText(duration, 200, 960);

    ctx.textAlign = "right";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 16px 'Courier New', monospace";
    ctx.fillText("VERIFICATION AUTHORITY", 1400, 920);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
    ctx.fillText("Neuron Academy CAO", 1400, 960);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "italic 16px Georgia, serif";
    ctx.fillText("Verifiable Credential Core", 1400, 990);

    ctx.textAlign = "center";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 16px 'Courier New', monospace";
    ctx.fillText("ON-CHAIN TRANSACTION REGISTRY HASH", 800, 1070);

    ctx.fillStyle = "#8ee630";
    ctx.font = "18px 'Courier New', monospace";
    ctx.fillText(selectedCert.hash, 800, 1110);

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Neuron_Certificate_${title.replace(/\s+/g, "_")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Certificate PNG downloaded successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate download image.");
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <div className="text-left">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">/ credentials</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2">
            Your verifiable achievements.
          </h1>
          <p className="text-muted-foreground mt-1 text-sm text-left">
            Every certificate is a W3C verifiable credential, anchored on-chain. One QR scan proves it.
          </p>
        </div>

        {loading ? (
          <div className="grid place-items-center h-48">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto" />
              <p className="text-muted-foreground text-sm font-mono uppercase tracking-wider">Retrieving Blockchain Credentials...</p>
            </div>
          </div>
        ) : certs.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card/40 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-6 backdrop-blur-sm relative overflow-hidden my-12">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <Award className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold">No Certificates Earned Yet</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Complete any course, watch the lecture video, and pass the practice assessment quiz with 100% to earn your verifiable blockchain certificate instantly!
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition shadow-lg"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {certs.map((c, i) => (
              <article
                key={i}
                className="group relative rounded-2xl border border-border bg-card/60 overflow-hidden hover:border-primary/40 transition text-left"
              >
                {/* decorative band */}
                <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,oklch(0.88_0.21_130/0.25),transparent_70%),radial-gradient(ellipse_at_30%_60%,oklch(0.65_0.22_290/0.2),transparent_70%)]" />

                <div className="relative p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--glow-lime)]">
                      <Award className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">grade</div>
                      <div className="font-display text-2xl font-bold text-primary">{c.grade}</div>
                    </div>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight mt-6 text-left">
                    {c.title}
                  </h3>
                  <div className="text-sm text-muted-foreground mt-1 text-left">
                    Issued by {c.issuer} · {c.date}
                  </div>

                  <div className="mt-6 grid grid-cols-[1fr_auto] gap-4 items-end">
                    <div className="text-left">
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                        on-chain hash
                      </div>
                      <div className="font-mono text-xs mt-1 break-all">{c.hash}</div>
                      <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.15em] text-primary">
                        <ShieldCheck className="h-3 w-3" /> verified · tamper-proof
                      </div>
                    </div>
                    {/* fake QR */}
                    <div className="grid grid-cols-7 grid-rows-7 gap-0.5 h-20 w-20 rounded-lg bg-background p-1.5 border border-border">
                      {Array.from({ length: 49 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-[1px] ${
                            // deterministic pattern
                            (i * 7919) % 3 === 0 ? "bg-foreground" : "bg-background"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCert(c)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs font-medium hover:opacity-90 transition"
                    >
                      <Eye className="h-3 w-3" /> View Credential
                    </button>
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-4 py-1.5 text-xs font-medium hover:bg-background transition"
                    >
                      <Share2 className="h-3 w-3" /> Share
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Verifiable Certificate Modal template */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md px-4 overflow-y-auto py-8">
          <div className="w-full max-w-3xl rounded-3xl border-2 border-primary/20 bg-card p-6 sm:p-10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-auto text-center border-double bg-[radial-gradient(ellipse_at_top,oklch(0.88_0.21_130/0.05),transparent_70%)]">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-5 right-5 p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Certificate Frame layout */}
            <div className="border border-border/80 rounded-2xl p-6 sm:p-12 space-y-8 relative">
              {/* Decorative watermark / seals */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none">
                <Award className="h-96 w-96 text-primary" />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono uppercase tracking-[0.25em] text-primary">neuron academy registry</div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">DIPLOMA OF LEARNING</h2>
                <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-3" />
              </div>

              <div className="space-y-4">
                <p className="font-serif text-sm italic text-muted-foreground">This official document certifies that</p>
                <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground underline decoration-primary decoration-2 underline-offset-8">
                  {selectedCert.recipientName || user?.name || "Aisha Khan"}
                </h3>
                <p className="font-serif text-sm italic text-muted-foreground">has successfully completed the adaptive curriculum for</p>
                <h4 className="font-display text-xl sm:text-2xl font-bold text-primary">
                  {selectedCert.courseName || selectedCert.title}
                </h4>
                <p className="text-xs font-mono tracking-wide text-muted-foreground">
                  With a graded achievement of <span className="text-primary font-bold">{selectedCert.grade}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/40 text-xs">
                <div className="space-y-1 text-left">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Course Duration</div>
                  <div className="font-semibold text-foreground">
                    {selectedCert.startDate || "Jun 01, 2026"} to {selectedCert.endDate || selectedCert.date}
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Verification Authority</div>
                  <div className="font-semibold text-foreground">Neuron Academy CAO</div>
                  <div className="font-serif italic text-muted-foreground text-[10px]">Verifiable Credential Core</div>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">on-chain transaction registry hash</div>
                <code className="text-[10px] font-mono break-all text-primary bg-background/60 p-2 rounded border border-border block">
                  {selectedCert.hash}
                </code>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-xs font-semibold shadow hover:scale-[1.01] transition cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" /> Print Diploma
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet text-white px-4 py-2.5 text-xs font-semibold shadow hover:scale-[1.01] transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> Download Certificate
              </button>
              <button
                onClick={() => {
                  toast.success("Credential hash copied!");
                  navigator.clipboard.writeText(selectedCert.hash);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold hover:bg-accent transition cursor-pointer"
              >
                Copy Transaction Hash
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default Certificates;
