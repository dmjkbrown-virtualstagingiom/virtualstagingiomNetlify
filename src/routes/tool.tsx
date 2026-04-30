import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import { generateRoomImageFn } from "../server/ai.functions";

export const Route = createFileRoute("/tool")({
  component: BuyerTool,
});

const S = {
  ink: "#1a1612",
  cream: "#f5f0e8",
  warm: "#e8dcc8",
  gold: "#b8965a",
  goldLight: "#d4b07a",
  muted: "#8a7f72",
  surface: "#faf7f2",
  white: "#ffffff",
} as const;

const BASE_ROOM_TYPES = [
  { id: "kitchen", label: "Kitchen" },
  { id: "livingroom", label: "Living Room" },
  { id: "diningroom", label: "Dining Room" },
  { id: "bedroom", label: "Bedroom" },
  { id: "kidsroom", label: "Kids Room" },
  { id: "playroom", label: "Playroom" },
  { id: "bathroom", label: "Bathroom" },
];

const STYLES = [
  { id: "coastal", label: "Coastal", desc: "Sea blues, natural linen, driftwood tones", gradient: "linear-gradient(135deg, #d4eaf5 0%, #a8d4e8 50%, #7ab8d2 100%)" },
  { id: "modernluxury", label: "Modern Luxury", desc: "Sleek, high-end, sophisticated", gradient: "linear-gradient(135deg, #e8e4dc 0%, #c8c0b0 50%, #a09080 100%)" },
  { id: "japandi", label: "Japandi", desc: "Warm wabi-sabi calm, organic forms", gradient: "linear-gradient(135deg, #e8e0d5 0%, #c8bfb0 50%, #a09285 100%)" },
  { id: "scandinavian", label: "Scandinavian", desc: "Clean lines, natural wood, muted palettes", gradient: "linear-gradient(135deg, #f0ede6 0%, #e4ddd3 50%, #d8cfc2 100%)" },
  { id: "modernfarmhouse", label: "Modern Farmhouse", desc: "Warm whites, shiplap, rustic warmth", gradient: "linear-gradient(135deg, #f0ebe0 0%, #ddd0b8 50%, #c8b898 100%)" },
  { id: "urbanmasculine", label: "Urban Masculine", desc: "Dark tones, raw steel, industrial luxe", gradient: "linear-gradient(135deg, #3d3933 0%, #5a5650 50%, #2d2b28 100%)" },
  { id: "biophilic", label: "Biophilic Design", desc: "Living walls, greenery, natural materials", gradient: "linear-gradient(135deg, #2d4a2a 0%, #4a7a45 50%, #88b880 100%)" },
  { id: "maximalist", label: "Maximalist", desc: "Bold colour, rich textures, layered patterns", gradient: "linear-gradient(135deg, #4a2d6b 0%, #7a4a95 50%, #d4a03a 100%)" },
];

const MAX_ROOMS = 5;

type Stage = "rooms" | "upload" | "style" | "generating" | "results";

interface SelectedRoom {
  instanceId: string; // e.g. "bedroom-1", "bedroom-2"
  baseId: string;     // e.g. "bedroom"
  label: string;      // e.g. "Bedroom 1", "Bedroom 2"
}

interface RoomImage {
  instanceId: string;
  baseId: string;
  label: string;
  url: string;
  afterUrl?: string;
  file?: File;
}

function BuyerTool() {
  const [stage, setStage] = useState<Stage>("rooms");
  const [selectedRooms, setSelectedRooms] = useState<SelectedRoom[]>([]);
  const [roomImages, setRoomImages] = useState<Record<string, RoomImage>>({});
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [showBefore, setShowBefore] = useState<Record<string, boolean>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getRoomCount = (baseId: string) => selectedRooms.filter((r) => r.baseId === baseId).length;

  const addRoom = (baseId: string, baseLabel: string) => {
    if (selectedRooms.length >= MAX_ROOMS) return;
    const count = getRoomCount(baseId);
    const instanceId = count === 0 ? baseId : `${baseId}-${count + 1}`;
    const label = count === 0 ? baseLabel : `${baseLabel} ${count + 1}`;
    setSelectedRooms((prev) => [...prev, { instanceId, baseId, label }]);
  };

  const removeRoom = (instanceId: string) => {
    setSelectedRooms((prev) => {
      const filtered = prev.filter((r) => r.instanceId !== instanceId);
      // Renumber remaining rooms of same base type
      const baseCounts: Record<string, number> = {};
      return filtered.map((r) => {
        baseCounts[r.baseId] = (baseCounts[r.baseId] || 0) + 1;
        const count = baseCounts[r.baseId];
        const baseRoom = BASE_ROOM_TYPES.find((b) => b.id === r.baseId)!;
        const newInstanceId = count === 1 ? r.baseId : `${r.baseId}-${count}`;
        const newLabel = count === 1 ? baseRoom.label : `${baseRoom.label} ${count}`;
        return { ...r, instanceId: newInstanceId, label: newLabel };
      });
    });
    setRoomImages((prev) => { const next = { ...prev }; delete next[instanceId]; return next; });
  };

  const handleFileForRoom = useCallback((instanceId: string, baseId: string, label: string, file: File) => {
    if (!file.type.startsWith("image/")) return;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxSize = 512;
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) { height = Math.round((height * maxSize) / width); width = maxSize; }
        else { width = Math.round((width * maxSize) / height); height = maxSize; }
      }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const compressedFile = new File([blob], `${instanceId}.jpg`, { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        setRoomImages((prev) => ({ ...prev, [instanceId]: { instanceId, baseId, label, url, file: compressedFile } }));
        URL.revokeObjectURL(objectUrl);
      }, "image/jpeg", 0.6);
    };
    img.src = objectUrl;
  }, []);

  const uploadedCount = selectedRooms.filter((r) => roomImages[r.instanceId]).length;
  const allUploaded = selectedRooms.length > 0 && uploadedCount === selectedRooms.length;

  const startGenerating = async () => {
    if (!selectedStyle || selectedRooms.length === 0) return;
    setStage("generating");
    setGeneratedCount(0);
    const updatedImages = { ...roomImages };

    for (let i = 0; i < selectedRooms.length; i++) {
      const room = selectedRooms[i];
      const roomImage = roomImages[room.instanceId];
      if (!roomImage?.file) { setGeneratedCount((prev) => prev + 1); continue; }

      try {
        const imageDataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(roomImage.file!);
        });

        const result = await generateRoomImageFn({ data: { imageDataUri, style: selectedStyle, roomId: room.baseId } });
        updatedImages[room.instanceId] = { ...updatedImages[room.instanceId], afterUrl: result.generatedImageUrl };
      } catch (error) {
        console.error("Generation failed for", room.instanceId, error);
      }

      setGeneratedCount((prev) => prev + 1);
    }

    setRoomImages(updatedImages);
    setTimeout(() => setStage("results"), 400);
  };

  const reset = () => {
    setStage("rooms"); setSelectedRooms([]); setRoomImages({});
    setSelectedStyle(null); setGeneratedCount(0); setShowBefore({});
  };

  const styleName = STYLES.find((s) => s.id === selectedStyle)?.label || "";

  return (
    <div style={{ minHeight: "calc(100vh - 72px)", background: S.surface }}>
      {/* Hero */}
      <div style={{ background: S.ink, padding: "56px 48px 64px", color: S.cream, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: "-60px", right: "-40px", width: "360px", height: "360px", background: "radial-gradient(circle, rgba(184,150,90,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <p style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: S.gold, fontWeight: 500, marginBottom: "16px" }}>Buyer Tool</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, lineHeight: 1.05, maxWidth: "580px", marginBottom: "16px" }}>
          Reimagine this home <em style={{ fontStyle: "italic", color: S.goldLight }}>in your style</em>
        </h1>
        <p style={{ color: S.muted, fontSize: "15px", maxWidth: "440px", lineHeight: 1.7, fontWeight: 300 }}>
          Select up to 5 rooms, upload your photos, choose a style, and watch AI transform every room.
        </p>
        <div style={{ display: "flex", gap: "0", marginTop: "40px", maxWidth: "600px" }}>
          {(["rooms", "upload", "style", "results"] as const).map((s, i) => (
            <div key={s} style={{ flex: 1, height: "3px", background: (stage === "results" || (stage === "style" && i < 3) || (stage === "upload" && i < 2) || (stage === "rooms" && i < 1) || (stage === "generating" && i < 3)) ? S.gold : "rgba(255,255,255,0.15)", marginRight: i < 3 ? "4px" : 0, borderRadius: "2px", transition: "background 0.4s ease" }} />
          ))}
        </div>
        <div style={{ display: "flex", marginTop: "8px", maxWidth: "600px", justifyContent: "space-between" }}>
          {["Select rooms", "Upload photos", "Choose style", "View results"].map((label) => (
            <span key={label} style={{ fontSize: "11px", color: S.muted, letterSpacing: "0.06em" }}>{label}</span>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "56px 48px" }}>

        {/* Stage: Room Selection */}
        {stage === "rooms" && (
          <>
            <SectionLabel>Select up to {MAX_ROOMS} rooms</SectionLabel>
            <p style={{ fontSize: "13px", color: S.muted, marginBottom: "8px" }}>
              {selectedRooms.length === 0 ? "Tap a room type to add it. You can add multiple bedrooms or bathrooms." : `${selectedRooms.length} of ${MAX_ROOMS} rooms selected.`}
            </p>
            {selectedRooms.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                {selectedRooms.map((room) => (
                  <div key={room.instanceId} style={{ display: "flex", alignItems: "center", gap: "6px", background: S.gold, color: S.white, padding: "6px 12px", borderRadius: "2px", fontSize: "12px", fontWeight: 500 }}>
                    {room.label}
                    <button onClick={() => removeRoom(room.instanceId)} style={{ background: "transparent", border: "none", color: S.white, cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: "0 0 0 4px" }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px", marginBottom: "48px" }}>
              {BASE_ROOM_TYPES.map((room) => {
                const count = getRoomCount(room.id);
                const isDisabled = selectedRooms.length >= MAX_ROOMS;
                return (
                  <div key={room.id} onClick={() => !isDisabled && addRoom(room.id, room.label)} style={{ padding: "20px 16px", background: count > 0 ? "#fdf5e8" : S.white, borderRadius: "2px", border: `2px solid ${count > 0 ? S.gold : S.warm}`, cursor: isDisabled ? "not-allowed" : "pointer", opacity: isDisabled && count === 0 ? 0.4 : 1, transition: "all 0.2s", textAlign: "center", boxShadow: "0 2px 12px rgba(26,22,18,0.06)" }}>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: count > 0 ? S.gold : S.ink }}>{room.label}</div>
                    {count > 0 && <div style={{ fontSize: "11px", color: S.gold, marginTop: "4px" }}>×{count} selected — tap to add more</div>}
                    {count === 0 && <div style={{ fontSize: "11px", color: S.muted, marginTop: "4px" }}>Tap to add</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setStage("upload")} disabled={selectedRooms.length === 0} style={{ background: selectedRooms.length > 0 ? S.gold : S.warm, color: S.white, padding: "14px 40px", borderRadius: "2px", border: "none", fontSize: "13px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: selectedRooms.length > 0 ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif" }}>
                Upload photos →
              </button>
            </div>
          </>
        )}

        {/* Stage: Upload */}
        {stage === "upload" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <SectionLabel>Upload your room photos</SectionLabel>
              <button onClick={() => setStage("rooms")} style={{ background: "transparent", border: "none", color: S.muted, cursor: "pointer", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
            </div>
            <p style={{ fontSize: "13px", color: S.muted, marginBottom: "32px" }}>Upload a photo for each room. {uploadedCount} of {selectedRooms.length} uploaded.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px", marginBottom: "48px" }}>
              {selectedRooms.map((room) => {
                const uploaded = roomImages[room.instanceId];
                return (
                  <div key={room.instanceId}>
                    <p style={{ fontSize: "12px", fontWeight: 500, color: S.ink, marginBottom: "8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{room.label}</p>
                    <div
                      onClick={() => fileInputRefs.current[room.instanceId]?.click()}
                      style={{ border: `2px dashed ${uploaded ? S.gold : S.warm}`, borderRadius: "2px", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", position: "relative", background: uploaded ? "transparent" : S.white, transition: "border-color 0.2s" }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFileForRoom(room.instanceId, room.baseId, room.label, file); }}
                    >
                      <input ref={(el) => { fileInputRefs.current[room.instanceId] = el; }} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileForRoom(room.instanceId, room.baseId, room.label, file); }} />
                      {uploaded ? (
                        <>
                          <img src={uploaded.url} alt={room.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          <div style={{ position: "absolute", top: "8px", right: "8px", width: "28px", height: "28px", background: S.gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckIcon /></div>
                        </>
                      ) : (
                        <div style={{ textAlign: "center", padding: "16px" }}>
                          <UploadIcon color={S.gold} />
                          <p style={{ fontSize: "12px", color: S.muted, marginTop: "8px" }}>Click or drag to upload</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setStage("style")} disabled={!allUploaded} style={{ background: allUploaded ? S.gold : S.warm, color: S.white, padding: "14px 40px", borderRadius: "2px", border: "none", fontSize: "13px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: allUploaded ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif" }}>
                Choose a style →
              </button>
            </div>
          </>
        )}

        {/* Stage: Style picker */}
        {stage === "style" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <SectionLabel>Choose your interior style</SectionLabel>
              <button onClick={() => setStage("upload")} style={{ background: "transparent", border: "none", color: S.muted, cursor: "pointer", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
            </div>
            <p style={{ fontSize: "13px", color: S.muted, marginBottom: "32px" }}>AI will reimagine all {selectedRooms.length} rooms in your chosen style.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", marginBottom: "48px" }}>
              {STYLES.map((style) => (
                <div key={style.id} onClick={() => setSelectedStyle(style.id)} style={{ cursor: "pointer", borderRadius: "2px", overflow: "hidden", border: `3px solid ${selectedStyle === style.id ? S.gold : "transparent"}`, transition: "all 0.2s ease", background: S.white, boxShadow: "0 4px 24px rgba(26,22,18,0.08)", transform: selectedStyle === style.id ? "translateY(-2px)" : "none" }}>
                  <div style={{ height: "100px", background: style.gradient, position: "relative" }}>
                    {selectedStyle === style.id && <div style={{ position: "absolute", top: "8px", right: "8px", width: "24px", height: "24px", background: S.gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckIcon /></div>}
                  </div>
                  <div style={{ padding: "12px 14px 14px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: S.ink, marginBottom: "3px" }}>{style.label}</div>
                    <div style={{ fontSize: "11px", color: S.muted, lineHeight: 1.4 }}>{style.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={startGenerating} disabled={!selectedStyle} style={{ background: selectedStyle ? S.gold : S.warm, color: S.white, padding: "14px 48px", borderRadius: "2px", border: "none", fontSize: "13px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: selectedStyle ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif" }}>
                Reimagine {selectedRooms.length} room{selectedRooms.length !== 1 ? "s" : ""} →
              </button>
            </div>
          </>
        )}

        {/* Stage: Generating */}
        {stage === "generating" && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: "72px", height: "72px", margin: "0 auto 24px", border: `2px solid ${S.warm}`, borderTop: `2px solid ${S.gold}`, borderRadius: "50%", animation: "spin 1.2s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 300, marginBottom: "12px" }}>Reimagining your rooms<span style={{ color: S.gold }}>...</span></h2>
            <p style={{ color: S.muted, fontSize: "14px", marginBottom: "40px" }}>
              Transforming {generatedCount} of {selectedRooms.length} rooms in <span style={{ color: S.ink, fontWeight: 500 }}>{styleName}</span> style
            </p>
            <div style={{ maxWidth: "400px", margin: "0 auto", height: "4px", background: S.warm, borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", background: S.gold, borderRadius: "2px", width: `${(generatedCount / selectedRooms.length) * 100}%`, transition: "width 0.6s ease" }} />
            </div>
            <p style={{ fontSize: "11px", color: S.muted, marginTop: "12px" }}>{generatedCount} / {selectedRooms.length} complete</p>
          </div>
        )}

        {/* Stage: Results */}
        {stage === "results" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
              <div>
                <SectionLabel>Your reimagined home</SectionLabel>
                <p style={{ fontSize: "13px", color: S.muted }}>Styled in <strong style={{ color: S.ink }}>{styleName}</strong>. Toggle each room to compare before and after.</p>
              </div>
              <button onClick={reset} style={{ background: "transparent", border: `1px solid ${S.warm}`, color: S.ink, padding: "8px 20px", borderRadius: "2px", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em" }}>Start over</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {selectedRooms.map((room) => {
                const roomImg = roomImages[room.instanceId];
                const isBefore = showBefore[room.instanceId];
                return (
                  <div key={room.instanceId} style={{ background: S.white, borderRadius: "2px", overflow: "hidden", boxShadow: "0 4px 24px rgba(26,22,18,0.08)" }}>
                    <div style={{ position: "relative", aspectRatio: "4/3" }}>
                      {isBefore ? (
                        <img src={roomImg.url} alt={room.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      ) : roomImg.afterUrl ? (
                        <img src={roomImg.afterUrl} alt={`${room.label} after`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: S.warm, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: S.muted, fontSize: "13px" }}>Generation failed</span>
                        </div>
                      )}
                      <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(26,22,18,0.7)", color: S.cream, fontSize: "10px", padding: "3px 8px", borderRadius: "2px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {isBefore ? "Before" : "After"}
                      </div>
                      {!isBefore && (
                        <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(184,150,90,0.9)", color: S.white, fontSize: "10px", padding: "3px 8px", borderRadius: "2px", letterSpacing: "0.06em" }}>
                          AI Visualisation
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: 500, color: S.ink, display: "block" }}>{room.label}</span>
                        <span style={{ fontSize: "11px", color: S.muted }}>{styleName} Style</span>
                      </div>
                      <button onClick={() => setShowBefore((prev) => ({ ...prev, [room.instanceId]: !prev[room.instanceId] }))} style={{ background: "transparent", border: `1px solid ${S.warm}`, color: S.muted, padding: "5px 12px", borderRadius: "2px", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em" }}>
                        {isBefore ? "Show after" : "Show before"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: "48px", padding: "32px", background: S.ink, borderRadius: "2px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ color: S.cream, fontSize: "15px", fontWeight: 400, marginBottom: "4px" }}>Love what you see?</p>
                <p style={{ color: S.muted, fontSize: "13px" }}>In production, buyers see this automatically on your listing page — no upload needed.</p>
              </div>
              <button onClick={reset} style={{ background: "transparent", border: "1px solid rgba(184,150,90,0.4)", color: S.cream, padding: "10px 24px", borderRadius: "2px", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Try another style
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: "#b8965a", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
      {children}
      <span style={{ flex: 1, height: "1px", background: "#e8dcc8", display: "block" }} />
    </p>
  );
}

function UploadIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

