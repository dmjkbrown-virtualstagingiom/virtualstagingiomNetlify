import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import React from "react";
import { useUser } from "@clerk/clerk-react";
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

const ROOM_TYPES = [
  { id: "kitchen", label: "Kitchen" },
  { id: "livingroom", label: "Living Room" },
  { id: "diningroom", label: "Dining Room" },
  { id: "bedroom", label: "Bedroom" },
  { id: "kidsroom", label: "Kids Room" },
  { id: "playroom", label: "Playroom" },
  { id: "bathroom", label: "Bathroom" },
  { id: "hallway", label: "Hallway" },
  { id: "office", label: "Home Office" },
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

const MAX_PHOTOS = 5;

type Stage = "upload" | "label" | "style" | "generating" | "results";

interface PhotoEntry {
  id: string;
  file: File;
  url: string;
  roomTypeId: string | null;
  afterUrl?: string;
}

interface SavedDesign {
  id: string;
  roomLabel: string;
  styleName: string;
  afterUrl: string;
  savedAt: string;
}

// Save a design to the user's account via Netlify Blobs
async function saveDesignToAccount(userId: string, design: SavedDesign) {
  try {
    await fetch("/api/save-design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, design }),
    });
  } catch (err) {
    console.error("Failed to save design:", err);
  }
}

// Download a generated image by fetching it as a blob
async function downloadImage(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    // Fallback: open in new tab if cross-origin download fails
    window.open(url, "_blank");
  }
}

function BuyerTool() {
  const { user } = useUser();
  const [stage, setStage] = useState<Stage>("upload");
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [showBefore, setShowBefore] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const processFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
    const remaining = MAX_PHOTOS - photos.length;
    const toProcess = arr.slice(0, remaining);

    toProcess.forEach(file => {
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
        canvas.toBlob(blob => {
          if (!blob) return;
          const compressedFile = new File([blob], file.name, { type: "image/jpeg" });
          const url = URL.createObjectURL(blob);
          const id = `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
          setPhotos(prev => prev.length < MAX_PHOTOS ? [...prev, { id, file: compressedFile, url, roomTypeId: null }] : prev);
          URL.revokeObjectURL(objectUrl);
        }, "image/jpeg", 0.6);
      };
      img.src = objectUrl;
    });
  }, [photos.length]);

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const setRoomType = (id: string, roomTypeId: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, roomTypeId } : p));
  };

  const allLabelled = photos.length > 0 && photos.every(p => p.roomTypeId !== null);

  const startGenerating = async () => {
    if (!selectedStyle || photos.length === 0) return;
    setStage("generating");
    setGeneratedCount(0);
    // Clear previous after images so we regenerate cleanly
    const updated = photos.map(p => ({ ...p, afterUrl: undefined }));

    for (let i = 0; i < updated.length; i++) {
      const photo = updated[i];
      try {
        const imageDataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(photo.file);
        });
        const result = await generateRoomImageFn({ data: { imageDataUri, style: selectedStyle, roomId: photo.roomTypeId! } });
        updated[i] = { ...updated[i], afterUrl: result.generatedImageUrl };
      } catch (err) {
        console.error("Generation failed for", photo.id, err);
      }
      setGeneratedCount(i + 1);
    }

    setPhotos(updated);
    setSavedIds(new Set()); // Reset saved state for new generation
    setTimeout(() => setStage("results"), 400);
  };

  // Try another style: keep photos and labels, just go back to style picker
  const tryAnotherStyle = () => {
    setSelectedStyle(null);
    setShowBefore({});
    setSavedIds(new Set());
    setStage("style");
  };

  // Full reset: clear everything
  const reset = () => {
    setStage("upload");
    setPhotos([]);
    setSelectedStyle(null);
    setGeneratedCount(0);
    setShowBefore({});
    setSavedIds(new Set());
  };

  const handleSaveDesign = async (photo: PhotoEntry) => {
    if (!user || !photo.afterUrl) return;
    const roomLabel = ROOM_TYPES.find(r => r.id === photo.roomTypeId)?.label || "Room";
    const styleName = STYLES.find(s => s.id === selectedStyle)?.label || "";

    setSavingIds(prev => new Set(prev).add(photo.id));
    const design: SavedDesign = {
      id: `${photo.id}-${Date.now()}`,
      roomLabel,
      styleName,
      afterUrl: photo.afterUrl,
      savedAt: new Date().toISOString(),
    };
    await saveDesignToAccount(user.id, design);
    setSavingIds(prev => { const s = new Set(prev); s.delete(photo.id); return s; });
    setSavedIds(prev => new Set(prev).add(photo.id));
  };

  const styleName = STYLES.find(s => s.id === selectedStyle)?.label || "";
  const stageIndex = { upload: 0, label: 1, style: 2, generating: 2, results: 3 }[stage];

  return (
    <div style={{ minHeight: "calc(100vh - 72px)", background: S.surface }}>
      <div style={{ background: S.ink, padding: "56px 48px 64px", color: S.cream, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: "-60px", right: "-40px", width: "360px", height: "360px", background: "radial-gradient(circle, rgba(184,150,90,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <p style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: S.gold, fontWeight: 500, marginBottom: "16px" }}>Buyer Tool</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, lineHeight: 1.05, maxWidth: "580px", marginBottom: "16px" }}>
          Reimagine this home <em style={{ fontStyle: "italic", color: S.goldLight }}>in your style</em>
        </h1>
        <p style={{ color: S.muted, fontSize: "15px", maxWidth: "440px", lineHeight: 1.7, fontWeight: 300 }}>
          Upload up to {MAX_PHOTOS} room photos, label each room, choose a style, and watch AI transform every room.
        </p>
        <div style={{ display: "flex", gap: "0", marginTop: "40px", maxWidth: "600px" }}>
          {(["upload", "label", "style", "results"] as const).map((s, i) => (
            <div key={s} style={{ flex: 1, height: "3px", background: i <= stageIndex ? S.gold : "rgba(255,255,255,0.15)", marginRight: i < 3 ? "4px" : 0, borderRadius: "2px", transition: "background 0.4s ease" }} />
          ))}
        </div>
        <div style={{ display: "flex", marginTop: "8px", maxWidth: "600px", justifyContent: "space-between" }}>
          {["Upload photos", "Label rooms", "Choose style", "View results"].map(label => (
            <span key={label} style={{ fontSize: "11px", color: S.muted, letterSpacing: "0.06em" }}>{label}</span>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "56px 48px" }}>

        {stage === "upload" && (
          <>
            <SectionLabel>Upload up to {MAX_PHOTOS} room photos</SectionLabel>
            <p style={{ fontSize: "13px", color: S.muted, marginBottom: "32px" }}>
              {photos.length === 0
                ? "Select up to 5 photos at once, or drag and drop them below."
                : `${photos.length} of ${MAX_PHOTOS} photos added. ${photos.length < MAX_PHOTOS ? "You can add more." : "Maximum reached."}`}
            </p>

            {photos.length < MAX_PHOTOS && (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
                style={{ border: `2px dashed ${dragging ? S.gold : S.warm}`, borderRadius: "4px", padding: "48px 32px", textAlign: "center", cursor: "pointer", background: dragging ? "#fdf5e8" : S.white, transition: "all 0.2s", marginBottom: "32px", position: "relative" }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                  onChange={e => { if (e.target.files) processFiles(e.target.files); e.target.value = ""; }}
                />
                <UploadIcon color={S.gold} />
                <p style={{ fontSize: "15px", color: S.ink, marginTop: "16px", fontWeight: 500 }}>Click to select photos</p>
                <p style={{ fontSize: "13px", color: S.muted, marginTop: "6px" }}>or drag and drop — up to {MAX_PHOTOS - photos.length} more photo{MAX_PHOTOS - photos.length !== 1 ? "s" : ""}</p>
              </div>
            )}

            {photos.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px", marginBottom: "48px" }}>
                {photos.map(photo => (
                  <div key={photo.id} style={{ position: "relative", borderRadius: "2px", overflow: "hidden", boxShadow: "0 2px 12px rgba(26,22,18,0.10)" }}>
                    <img src={photo.url} alt="Room" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); removePhoto(photo.id); }}
                      style={{ position: "absolute", top: "6px", right: "6px", width: "24px", height: "24px", background: "rgba(26,22,18,0.7)", border: "none", borderRadius: "50%", color: S.cream, cursor: "pointer", fontSize: "14px", lineHeight: "1", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setStage("label")}
                disabled={photos.length === 0}
                style={{ background: photos.length > 0 ? S.gold : S.warm, color: S.white, padding: "14px 40px", borderRadius: "2px", border: "none", fontSize: "13px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: photos.length > 0 ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif" }}
              >
                Label rooms
              </button>
            </div>
          </>
        )}

        {stage === "label" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <SectionLabel>What room is each photo?</SectionLabel>
              <button onClick={() => setStage("upload")} style={{ background: "transparent", border: "none", color: S.muted, cursor: "pointer", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>Back</button>
            </div>
            <p style={{ fontSize: "13px", color: S.muted, marginBottom: "32px" }}>
              Select the room type for each photo. {photos.filter(p => p.roomTypeId).length} of {photos.length} labelled.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px", marginBottom: "48px" }}>
              {photos.map((photo, idx) => (
                <div key={photo.id} style={{ background: S.white, borderRadius: "2px", overflow: "hidden", boxShadow: "0 2px 12px rgba(26,22,18,0.08)" }}>
                  <div style={{ position: "relative" }}>
                    <img src={photo.url} alt={`Photo ${idx + 1}`} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                    <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(26,22,18,0.65)", color: S.cream, fontSize: "11px", padding: "3px 8px", borderRadius: "2px" }}>Photo {idx + 1}</div>
                    {photo.roomTypeId && (
                      <div style={{ position: "absolute", top: "8px", right: "8px", width: "26px", height: "26px", background: S.gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckIcon /></div>
                    )}
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <p style={{ fontSize: "11px", color: S.muted, marginBottom: "10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Room type</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {ROOM_TYPES.map(rt => (
                        <button
                          key={rt.id}
                          onClick={() => setRoomType(photo.id, rt.id)}
                          style={{
                            padding: "5px 10px", borderRadius: "2px", fontSize: "11px", fontWeight: 500,
                            border: `1.5px solid ${photo.roomTypeId === rt.id ? S.gold : S.warm}`,
                            background: photo.roomTypeId === rt.id ? S.gold : "transparent",
                            color: photo.roomTypeId === rt.id ? S.white : S.ink,
                            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s"
                          }}
                        >
                          {rt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setStage("style")}
                disabled={!allLabelled}
                style={{ background: allLabelled ? S.gold : S.warm, color: S.white, padding: "14px 40px", borderRadius: "2px", border: "none", fontSize: "13px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: allLabelled ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif" }}
              >
                Choose a style
              </button>
            </div>
          </>
        )}

        {stage === "style" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <SectionLabel>Choose your interior style</SectionLabel>
              <button onClick={() => setStage("label")} style={{ background: "transparent", border: "none", color: S.muted, cursor: "pointer", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>Back</button>
            </div>
            <p style={{ fontSize: "13px", color: S.muted, marginBottom: "32px" }}>AI will reimagine all {photos.length} room{photos.length !== 1 ? "s" : ""} in your chosen style.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", marginBottom: "48px" }}>
              {STYLES.map(style => (
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
                Reimagine {photos.length} room{photos.length !== 1 ? "s" : ""}
              </button>
            </div>
          </>
        )}

        {stage === "generating" && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: "72px", height: "72px", margin: "0 auto 24px", border: `2px solid ${S.warm}`, borderTop: `2px solid ${S.gold}`, borderRadius: "50%", animation: "spin 1.2s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontWeight: 300, marginBottom: "12px" }}>Reimagining your rooms<span style={{ color: S.gold }}>...</span></h2>
            <p style={{ color: S.muted, fontSize: "14px", marginBottom: "40px" }}>
              Transforming {generatedCount} of {photos.length} rooms in <span style={{ color: S.ink, fontWeight: 500 }}>{styleName}</span> style
            </p>
            <div style={{ maxWidth: "400px", margin: "0 auto", height: "4px", background: S.warm, borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", background: S.gold, borderRadius: "2px", width: `${(generatedCount / photos.length) * 100}%`, transition: "width 0.6s ease" }} />
            </div>
            <p style={{ fontSize: "11px", color: S.muted, marginTop: "12px" }}>{generatedCount} / {photos.length} complete</p>
          </div>
        )}

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
              {photos.map(photo => {
                const roomLabel = ROOM_TYPES.find(r => r.id === photo.roomTypeId)?.label || "Room";
                const isBefore = showBefore[photo.id];
                const isSaved = savedIds.has(photo.id);
                const isSaving = savingIds.has(photo.id);
                return (
                  <div key={photo.id} style={{ background: S.white, borderRadius: "2px", overflow: "hidden", boxShadow: "0 4px 24px rgba(26,22,18,0.08)" }}>
                    <div style={{ position: "relative", aspectRatio: "4/3" }}>
                      {isBefore ? (
                        <img src={photo.url} alt={roomLabel} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      ) : photo.afterUrl ? (
                        <img src={photo.afterUrl} alt={`${roomLabel} after`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: S.warm, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: S.muted, fontSize: "13px" }}>Generation failed</span>
                        </div>
                      )}
                      <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(26,22,18,0.7)", color: S.cream, fontSize: "10px", padding: "3px 8px", borderRadius: "2px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {isBefore ? "Before" : "After"}
                      </div>
                      {!isBefore && photo.afterUrl && (
                        <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(184,150,90,0.9)", color: S.white, fontSize: "10px", padding: "3px 8px", borderRadius: "2px", letterSpacing: "0.06em" }}>
                          AI Visualisation
                        </div>
                      )}
                    </div>

                    {/* Card footer */}
                    <div style={{ padding: "12px 16px", borderTop: `1px solid ${S.warm}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <div>
                          <span style={{ fontSize: "13px", fontWeight: 500, color: S.ink, display: "block" }}>{roomLabel}</span>
                          <span style={{ fontSize: "11px", color: S.muted }}>{styleName} Style</span>
                        </div>
                        <button
                          onClick={() => setShowBefore(prev => ({ ...prev, [photo.id]: !prev[photo.id] }))}
                          style={{ background: "transparent", border: `1px solid ${S.warm}`, color: S.muted, padding: "5px 12px", borderRadius: "2px", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em" }}
                        >
                          {isBefore ? "Show after" : "Show before"}
                        </button>
                      </div>

                      {/* Action buttons — only shown when viewing the after image */}
                      {!isBefore && photo.afterUrl && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          {/* Download button */}
                          <button
                            onClick={() => downloadImage(photo.afterUrl!, `${roomLabel}-${styleName}.jpg`)}
                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "transparent", border: `1px solid ${S.gold}`, color: S.gold, padding: "7px 12px", borderRadius: "2px", fontSize: "11px", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em" }}
                          >
                            <DownloadIcon />
                            Download
                          </button>

                          {/* Save to account button — only shown if signed in */}
                          {user && (
                            <button
                              onClick={() => handleSaveDesign(photo)}
                              disabled={isSaved || isSaving}
                              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: isSaved ? S.warm : "transparent", border: `1px solid ${isSaved ? S.warm : S.muted}`, color: isSaved ? S.muted : S.muted, padding: "7px 12px", borderRadius: "2px", fontSize: "11px", fontWeight: 500, cursor: isSaved ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em" }}
                            >
                              {isSaving ? "Saving..." : isSaved ? "✓ Saved" : "Save to account"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom CTA bar */}
            <div style={{ marginTop: "48px", padding: "32px", background: S.ink, borderRadius: "2px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
              <div>
                <p style={{ color: S.cream, fontSize: "15px", fontWeight: 400, marginBottom: "4px" }}>Love what you see?</p>
                <p style={{ color: S.muted, fontSize: "13px" }}>Your photos are still loaded — pick a new style without re-uploading.</p>
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={tryAnotherStyle}
                  style={{ background: S.gold, color: S.white, padding: "10px 24px", borderRadius: "2px", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", border: "none" }}
                >
                  Try another style
                </button>
                <button
                  onClick={reset}
                  style={{ background: "transparent", border: "1px solid rgba(184,150,90,0.4)", color: S.cream, padding: "10px 24px", borderRadius: "2px", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}
                >
                  Start over
                </button>
              </div>
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
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
