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

const STYLES = [
  {
    id: "scandinavian",
    label: "Scandinavian",
    desc: "Clean lines, natural wood, muted palettes",
    gradient: "linear-gradient(135deg, #f0ede6 0%, #e4ddd3 50%, #d8cfc2 100%)",
  },
  {
    id: "contemporary",
    label: "Contemporary",
    desc: "Sleek, modern, minimal forms",
    gradient: "linear-gradient(135deg, #e8eef2 0%, #d0dce5 50%, #b8c8d4 100%)",
  },
  {
    id: "industrial",
    label: "Industrial",
    desc: "Raw steel, exposed brick, urban edge",
    gradient: "linear-gradient(135deg, #3d3933 0%, #5a5650 50%, #2d2b28 100%)",
  },
  {
    id: "maximalist",
    label: "Maximalist",
    desc: "Bold colour, rich textures, layered patterns",
    gradient: "linear-gradient(135deg, #4a2d6b 0%, #7a4a95 50%, #d4a03a 100%)",
  },
  {
    id: "japandi",
    label: "Japandi",
    desc: "Warm wabi-sabi calm, organic forms",
    gradient: "linear-gradient(135deg, #e8e0d5 0%, #c8bfb0 50%, #a09285 100%)",
  },
  {
    id: "coastal",
    label: "Coastal",
    desc: "Sea blues, natural linen, driftwood tones",
    gradient: "linear-gradient(135deg, #d4eaf5 0%, #a8d4e8 50%, #7ab8d2 100%)",
  },
  {
    id: "artdeco",
    label: "Art Deco",
    desc: "Geometric glamour, marble, gold",
    gradient: "linear-gradient(135deg, #1a1408 0%, #3d3010 50%, #b8965a 100%)",
  },
  {
    id: "biophilic",
    label: "Biophilic",
    desc: "Living walls, greenery, natural materials",
    gradient: "linear-gradient(135deg, #2d4a2a 0%, #4a7a45 50%, #88b880 100%)",
  },
];

type Stage = "upload" | "style" | "generating" | "results";

interface UploadedImage {
  url: string;
  afterUrl?: string;
  name: string;
  selected: boolean;
  file?: File;
}

function BuyerTool() {
  const [stage, setStage] = useState<Stage>("upload");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [showBefore, setShowBefore] = useState<Record<number, boolean>>({});
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      setImages((prev) => [
        ...prev,
        { url, name: file.name.replace(/\.[^.]+$/, ""), selected: true, file },
      ]);
    });
  }, []);

  const toggleSelect = (idx: number) => {
    setImages((prev) =>
      prev.map((img, i) =>
        i === idx ? { ...img, selected: !img.selected } : img,
      ),
    );
  };

  const selectedImages = images.filter((img) => img.selected);

  const startGenerating = async () => {
    if (!selectedStyle || selectedImages.length === 0) return;
    setStage("generating");
    setGeneratedCount(0);

    const updatedImages = [...images];

    for (let i = 0; i < selectedImages.length; i++) {
      const img = selectedImages[i];
      const imageIndex = images.findIndex((orig) => orig.name === img.name);

      try {
        if (img.file) {
          const formData = new FormData();
          formData.append("file", img.file);
          formData.append("style", selectedStyle);

          const result = await generateRoomImageFn({ data: formData });
          updatedImages[imageIndex].afterUrl = result.generatedImageUrl;
        } else {
          // Mock behavior for demo images (they don't have a File object, just an afterUrl)
          await new Promise((resolve) => setTimeout(resolve, 1800));
        }
      } catch (error) {
        console.error("Generation failed for", img.name, error);
      }

      setGeneratedCount((prev) => prev + 1);
    }

    setImages(updatedImages);
    setTimeout(() => setStage("results"), 400);
  };

  const toggleBefore = (idx: number) => {
    setShowBefore((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const reset = () => {
    setStage("upload");
    setImages([]);
    setSelectedStyle(null);
    setGeneratedCount(0);
    setShowBefore({});
  };

  return (
    <div style={{ minHeight: "calc(100vh - 72px)", background: S.surface }}>
      {/* Hero */}
      <div
        style={{
          background: S.ink,
          padding: "56px 48px 64px",
          color: S.cream,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            right: "-40px",
            width: "360px",
            height: "360px",
            background:
              "radial-gradient(circle, rgba(184,150,90,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: S.gold,
            fontWeight: 500,
            marginBottom: "16px",
          }}
        >
          Buyer Tool
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 300,
            lineHeight: 1.05,
            maxWidth: "580px",
            marginBottom: "16px",
          }}
        >
          Reimagine this home{" "}
          <em style={{ fontStyle: "italic", color: S.goldLight }}>
            in your style
          </em>
        </h1>
        <p
          style={{
            color: S.muted,
            fontSize: "15px",
            maxWidth: "440px",
            lineHeight: 1.7,
            fontWeight: 300,
          }}
        >
          Upload property photos, choose your preferred interior style, and
          watch AI transform every room in 30 seconds.
        </p>

        {/* Step indicator */}
        <div
          style={{
            display: "flex",
            gap: "0",
            marginTop: "40px",
            maxWidth: "540px",
          }}
        >
          {(["upload", "style", "results"] as const).map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: "3px",
                background:
                  stage === "results" ||
                  (stage === "style" && i < 2) ||
                  (stage === "upload" && i < 1) ||
                  (stage === "generating" && i < 2)
                    ? S.gold
                    : "rgba(255,255,255,0.15)",
                marginRight: i < 2 ? "4px" : 0,
                borderRadius: "2px",
                transition: "background 0.4s ease",
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "8px",
            maxWidth: "540px",
            justifyContent: "space-between",
          }}
        >
          {["Upload photos", "Choose style", "View results"].map((label, i) => (
            <span
              key={label}
              style={{
                fontSize: "11px",
                color: S.muted,
                letterSpacing: "0.06em",
                fontWeight:
                  i ===
                  ["upload", "style", "results"].indexOf(
                    stage === "generating" ? "style" : stage,
                  )
                    ? 500
                    : 400,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <main
        style={{ maxWidth: "960px", margin: "0 auto", padding: "56px 48px" }}
      >
        {/* Stage: Upload */}
        {stage === "upload" && (
          <>
            <SectionLabel>Upload property photos</SectionLabel>

            <div
              style={{
                border: `2px dashed ${dragOver ? S.gold : S.warm}`,
                borderRadius: "2px",
                padding: "64px 32px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.25s ease",
                background: dragOver ? "#fdf9f3" : S.white,
                position: "relative",
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFiles(e.target.files)}
              />
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  margin: "0 auto 16px",
                  background: S.warm,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UploadIcon color={S.gold} />
              </div>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "24px",
                  fontWeight: 400,
                  color: S.ink,
                  marginBottom: "8px",
                }}
              >
                Drop your property photos here
              </h3>
              <p style={{ fontSize: "13px", color: S.muted }}>
                or{" "}
                <span style={{ color: S.gold, textDecoration: "underline" }}>
                  browse to upload
                </span>
              </p>
              <p style={{ fontSize: "11px", color: S.muted, marginTop: "8px" }}>
                JPG, PNG, WEBP — up to 20 photos
              </p>
            </div>

            {/* Demo images shortcut */}
            {images.length === 0 && (
              <div style={{ marginTop: "24px", textAlign: "center" }}>
                <p
                  style={{
                    fontSize: "13px",
                    color: S.muted,
                    marginBottom: "12px",
                  }}
                >
                  Or use demo property photos:
                </p>
                <button
                  onClick={() => {
                    const demos = [
                      {
                        url: "/examples/bedroom-before.webp",
                        afterUrl: "/examples/bedroom-after.jpeg",
                        name: "Bedroom",
                      },
                      {
                        url: "/examples/hallway-before.webp",
                        afterUrl: "/examples/hallway-after.jpeg",
                        name: "Hallway",
                      },
                      {
                        url: "/examples/kitchen-before.webp",
                        afterUrl: "/examples/kitchen-after.jpeg",
                        name: "Kitchen",
                      },
                      {
                        url: "/examples/living-room-before.webp",
                        afterUrl: "/examples/living-room-after.png",
                        name: "Living Room",
                      },
                      {
                        url: "/examples/playroom-before.webp",
                        afterUrl: "/examples/playroom-after.jpeg",
                        name: "Play Room",
                      },
                    ];
                    setImages(demos.map((d) => ({ ...d, selected: true })));
                  }}
                  style={{
                    background: "transparent",
                    border: `1px solid ${S.warm}`,
                    color: S.ink,
                    padding: "10px 24px",
                    borderRadius: "2px",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Load demo photos
                </button>
              </div>
            )}

            {/* Image grid */}
            {images.length > 0 && (
              <div style={{ marginTop: "32px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: S.muted }}>
                    {selectedImages.length} of {images.length} photos selected
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: "transparent",
                      border: `1px solid ${S.warm}`,
                      color: S.ink,
                      padding: "6px 16px",
                      borderRadius: "2px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Add more
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleSelect(idx)}
                      style={{
                        position: "relative",
                        aspectRatio: "4/3",
                        borderRadius: "2px",
                        overflow: "hidden",
                        cursor: "pointer",
                        border: `3px solid ${img.selected ? S.gold : "transparent"}`,
                        transition: "border-color 0.2s",
                      }}
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: img.selected
                            ? "rgba(184,150,90,0.15)"
                            : "rgba(26,22,18,0)",
                          transition: "background 0.2s",
                        }}
                      />
                      {img.selected && (
                        <div
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            width: "28px",
                            height: "28px",
                            background: S.gold,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CheckIcon />
                        </div>
                      )}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "8px",
                          left: "8px",
                          background: "rgba(26,22,18,0.7)",
                          color: S.cream,
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "2px",
                        }}
                      >
                        {img.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length > 0 && (
              <div
                style={{
                  marginTop: "40px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setStage("style")}
                  disabled={selectedImages.length === 0}
                  style={{
                    background: selectedImages.length > 0 ? S.gold : S.warm,
                    color: S.white,
                    padding: "14px 40px",
                    borderRadius: "2px",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor:
                      selectedImages.length > 0 ? "pointer" : "not-allowed",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "background 0.2s",
                  }}
                >
                  Choose a style →
                </button>
              </div>
            )}
          </>
        )}

        {/* Stage: Style picker */}
        {stage === "style" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <SectionLabel>Choose your interior style</SectionLabel>
              <button
                onClick={() => setStage("upload")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: S.muted,
                  cursor: "pointer",
                  fontSize: "13px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                ← Back
              </button>
            </div>
            <p
              style={{ fontSize: "13px", color: S.muted, marginBottom: "32px" }}
            >
              AI will reimagine all {selectedImages.length} selected photo
              {selectedImages.length !== 1 ? "s" : ""} in your chosen style.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "16px",
                marginBottom: "48px",
              }}
            >
              {STYLES.map((style) => (
                <div
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  style={{
                    cursor: "pointer",
                    borderRadius: "2px",
                    overflow: "hidden",
                    border: `3px solid ${selectedStyle === style.id ? S.gold : "transparent"}`,
                    transition: "all 0.2s ease",
                    background: S.white,
                    boxShadow: "0 4px 24px rgba(26,22,18,0.08)",
                    transform:
                      selectedStyle === style.id ? "translateY(-2px)" : "none",
                  }}
                >
                  <div
                    style={{
                      height: "100px",
                      background: style.gradient,
                      position: "relative",
                    }}
                  >
                    {selectedStyle === style.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          width: "24px",
                          height: "24px",
                          background: S.gold,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CheckIcon />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "12px 14px 14px" }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: S.ink,
                        marginBottom: "3px",
                      }}
                    >
                      {style.label}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: S.muted,
                        lineHeight: 1.4,
                      }}
                    >
                      {style.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={startGenerating}
                disabled={!selectedStyle}
                style={{
                  background: selectedStyle ? S.gold : S.warm,
                  color: S.white,
                  padding: "14px 48px",
                  borderRadius: "2px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: selectedStyle ? "pointer" : "not-allowed",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "background 0.2s",
                }}
              >
                Reimagine {selectedImages.length} room
                {selectedImages.length !== 1 ? "s" : ""} →
              </button>
            </div>
          </>
        )}

        {/* Stage: Generating */}
        {stage === "generating" && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ marginBottom: "32px" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  margin: "0 auto 24px",
                  border: `2px solid ${S.warm}`,
                  borderTop: `2px solid ${S.gold}`,
                  borderRadius: "50%",
                  animation: "spin 1.2s linear infinite",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "32px",
                fontWeight: 300,
                marginBottom: "12px",
              }}
            >
              Reimagining your rooms<span style={{ color: S.gold }}>...</span>
            </h2>
            <p
              style={{ color: S.muted, fontSize: "14px", marginBottom: "40px" }}
            >
              Transforming {generatedCount} of {selectedImages.length} rooms in{" "}
              <span style={{ color: S.ink, fontWeight: 500 }}>
                {STYLES.find((s) => s.id === selectedStyle)?.label}
              </span>{" "}
              style
            </p>
            <div
              style={{
                maxWidth: "400px",
                margin: "0 auto",
                height: "4px",
                background: S.warm,
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: S.gold,
                  borderRadius: "2px",
                  width: `${(generatedCount / selectedImages.length) * 100}%`,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <p style={{ fontSize: "11px", color: S.muted, marginTop: "12px" }}>
              {generatedCount} / {selectedImages.length} complete
            </p>
          </div>
        )}

        {/* Stage: Results */}
        {stage === "results" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "32px",
              }}
            >
              <div>
                <SectionLabel>Your reimagined home</SectionLabel>
                <p style={{ fontSize: "13px", color: S.muted }}>
                  Styled in{" "}
                  <strong style={{ color: S.ink }}>
                    {STYLES.find((s) => s.id === selectedStyle)?.label}
                  </strong>
                  . Toggle each room to compare before and after.
                </p>
              </div>
              <button
                onClick={reset}
                style={{
                  background: "transparent",
                  border: `1px solid ${S.warm}`,
                  color: S.ink,
                  padding: "8px 20px",
                  borderRadius: "2px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.06em",
                }}
              >
                Start over
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {selectedImages.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    background: S.white,
                    borderRadius: "2px",
                    overflow: "hidden",
                    boxShadow: "0 4px 24px rgba(26,22,18,0.08)",
                  }}
                >
                  <div style={{ position: "relative", aspectRatio: "4/3" }}>
                    {showBefore[idx] ? (
                      <img
                        src={img.url}
                        alt={img.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : img.afterUrl ? (
                      <img
                        src={img.afterUrl}
                        alt={`${img.name} after`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <StyledRoomPlaceholder
                        style={selectedStyle!}
                        roomName={img.name}
                      />
                    )}
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        background: "rgba(26,22,18,0.7)",
                        color: S.cream,
                        fontSize: "10px",
                        padding: "3px 8px",
                        borderRadius: "2px",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {showBefore[idx] ? "Before" : "After"}
                    </div>
                    {!showBefore[idx] && (
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: "rgba(184,150,90,0.9)",
                          color: S.white,
                          fontSize: "10px",
                          padding: "3px 8px",
                          borderRadius: "2px",
                          letterSpacing: "0.06em",
                        }}
                      >
                        AI Visualisation
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      padding: "14px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: S.ink,
                      }}
                    >
                      {img.name}
                    </span>
                    <button
                      onClick={() => toggleBefore(idx)}
                      style={{
                        background: "transparent",
                        border: `1px solid ${S.warm}`,
                        color: S.muted,
                        padding: "5px 12px",
                        borderRadius: "2px",
                        fontSize: "11px",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {showBefore[idx] ? "Show after" : "Show before"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "48px",
                padding: "32px",
                background: S.ink,
                borderRadius: "2px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    color: S.cream,
                    fontSize: "15px",
                    fontWeight: 400,
                    marginBottom: "4px",
                  }}
                >
                  Love what you see?
                </p>
                <p style={{ color: S.muted, fontSize: "13px" }}>
                  In production, buyers see this automatically on your listing
                  page — no upload needed.
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={reset}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(184,150,90,0.4)",
                    color: S.cream,
                    padding: "10px 24px",
                    borderRadius: "2px",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Try another style
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
    <p
      style={{
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "#b8965a",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {children}
      <span
        style={{
          flex: 1,
          height: "1px",
          background: "#e8dcc8",
          display: "block",
        }}
      />
    </p>
  );
}

function StyledRoomPlaceholder({
  style,
  roomName,
}: {
  style: string;
  roomName: string;
}) {
  const palettes: Record<string, { bg: string; accent: string; text: string }> =
    {
      scandinavian: { bg: "#f0ede6", accent: "#c8b9a0", text: "#5a5040" },
      contemporary: { bg: "#e0e8ef", accent: "#90a8c0", text: "#2a3a4a" },
      industrial: { bg: "#3d3933", accent: "#8a7a6a", text: "#c0b0a0" },
      maximalist: { bg: "#4a2d6b", accent: "#d4a03a", text: "#f5e0d0" },
      japandi: { bg: "#e8e0d5", accent: "#b0a090", text: "#4a3a2a" },
      coastal: { bg: "#d4eaf5", accent: "#78b0d0", text: "#1a3a5a" },
      artdeco: { bg: "#1a1408", accent: "#b8965a", text: "#f5e8d0" },
      biophilic: { bg: "#2d4a2a", accent: "#88b880", text: "#d0e8c8" },
    };
  const palette = palettes[style] || palettes.contemporary;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: palette.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "4px",
          background: palette.accent,
          borderRadius: "2px",
        }}
      />
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "18px",
          fontWeight: 300,
          color: palette.text,
          letterSpacing: "0.06em",
        }}
      >
        {roomName}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: palette.accent,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        AI Generated
      </div>
      <div
        style={{
          width: "32px",
          height: "4px",
          background: palette.accent,
          borderRadius: "2px",
          opacity: 0.5,
        }}
      />
    </div>
  );
}

function UploadIcon({ color }: { color: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
