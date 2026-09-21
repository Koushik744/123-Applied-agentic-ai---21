import { UploadedImage } from "../types";

/**
 * Generates crisp, realistic sample images rendered on an HTML5 canvas
 * and exported as valid JPEG base64 strings so that Gemini multimodal vision
 * can immediately perform real semantic detection, object recognition, and VQA.
 */
function createSampleCanvasImage(
  filename: string,
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): UploadedImage {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    drawFn(ctx, width, height);
  }

  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, "");

  return {
    id: `sample-${filename.toLowerCase().replace(/\./g, "-")}`,
    filename,
    mimeType: "image/jpeg",
    data: base64Data,
    previewUrl: dataUrl,
    fileSize: `${Math.round((base64Data.length * 3) / 4 / 1024)} KB`,
    width,
    height,
    source: "sample",
  };
}

export function generateSampleDataset(): UploadedImage[] {
  const samples: UploadedImage[] = [];

  // 1. Red Sports Car near Building
  samples.push(
    createSampleCanvasImage("red_car_building.jpg", 640, 480, (ctx, w, h) => {
      // Sky & background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
      skyGrad.addColorStop(0, "#38bdf8");
      skyGrad.addColorStop(1, "#bae6fd");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.6);

      // Modern Glass Building in background
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(w * 0.15, h * 0.05, w * 0.7, h * 0.55);

      // Glass windows grid
      ctx.fillStyle = "#60a5fa";
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 8; c++) {
          ctx.fillRect(
            w * 0.18 + c * (w * 0.075),
            h * 0.08 + r * (h * 0.08),
            w * 0.055,
            h * 0.055
          );
        }
      }

      // Asphalt Road
      ctx.fillStyle = "#334155";
      ctx.fillRect(0, h * 0.6, w, h * 0.4);

      // Road markings
      ctx.fillStyle = "#facc15";
      ctx.fillRect(w * 0.1, h * 0.92, w * 0.25, 6);
      ctx.fillRect(w * 0.55, h * 0.92, w * 0.25, 6);

      // Red Car Body
      ctx.fillStyle = "#dc2626"; // Vibrant Red
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.78);
      ctx.lineTo(w * 0.28, h * 0.68);
      ctx.lineTo(w * 0.42, h * 0.62);
      ctx.lineTo(w * 0.65, h * 0.62);
      ctx.lineTo(w * 0.78, h * 0.7);
      ctx.lineTo(w * 0.84, h * 0.74);
      ctx.lineTo(w * 0.84, h * 0.82);
      ctx.lineTo(w * 0.18, h * 0.82);
      ctx.closePath();
      ctx.fill();

      // Car Roof & Windshield
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.moveTo(w * 0.38, h * 0.63);
      ctx.lineTo(w * 0.45, h * 0.64);
      ctx.lineTo(w * 0.62, h * 0.64);
      ctx.lineTo(w * 0.72, h * 0.71);
      ctx.lineTo(w * 0.33, h * 0.71);
      ctx.closePath();
      ctx.fill();

      // Windows tint
      ctx.fillStyle = "#93c5fd";
      ctx.beginPath();
      ctx.moveTo(w * 0.44, h * 0.64);
      ctx.lineTo(w * 0.54, h * 0.64);
      ctx.lineTo(w * 0.54, h * 0.7);
      ctx.lineTo(w * 0.38, h * 0.7);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w * 0.56, h * 0.64);
      ctx.lineTo(w * 0.64, h * 0.64);
      ctx.lineTo(w * 0.7, h * 0.7);
      ctx.lineTo(w * 0.56, h * 0.7);
      ctx.closePath();
      ctx.fill();

      // Headlight
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(w * 0.81, h * 0.74, w * 0.03, h * 0.03);

      // Wheels
      const drawWheel = (cx: number, cy: number, r: number) => {
        ctx.fillStyle = "#09090b";
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      };
      drawWheel(w * 0.32, h * 0.82, w * 0.065);
      drawWheel(w * 0.72, h * 0.82, w * 0.065);
    })
  );

  // 2. Dog outdoors in the park
  samples.push(
    createSampleCanvasImage("dog_outdoors.jpg", 640, 480, (ctx, w, h) => {
      // Sunny outdoor park
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      skyGrad.addColorStop(0, "#7dd3fc");
      skyGrad.addColorStop(1, "#e0f2fe");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.45);

      // Sun
      ctx.fillStyle = "#fde047";
      ctx.beginPath();
      ctx.arc(w * 0.85, h * 0.18, 40, 0, Math.PI * 2);
      ctx.fill();

      // Park Green Lawn
      const grassGrad = ctx.createLinearGradient(0, h * 0.4, 0, h);
      grassGrad.addColorStop(0, "#4ade80");
      grassGrad.addColorStop(1, "#15803d");
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, h * 0.4, w, h * 0.6);

      // Trees in background
      for (let i = 0; i < 4; i++) {
        const tx = w * 0.1 + i * (w * 0.24);
        ctx.fillStyle = "#78350f";
        ctx.fillRect(tx + 20, h * 0.32, 16, 60);
        ctx.fillStyle = "#166534";
        ctx.beginPath();
        ctx.arc(tx + 28, h * 0.3, 45, 0, Math.PI * 2);
        ctx.fill();
      }

      // Golden Retriever Dog
      // Body
      ctx.fillStyle = "#d97706"; // Golden/amber coat
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.68, w * 0.18, h * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dog Head
      ctx.beginPath();
      ctx.arc(w * 0.68, h * 0.6, w * 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Dog Snout
      ctx.beginPath();
      ctx.ellipse(w * 0.75, h * 0.63, w * 0.04, h * 0.03, 0, 0, Math.PI * 2);
      ctx.fill();
      // Black Nose
      ctx.fillStyle = "#18181b";
      ctx.beginPath();
      ctx.arc(w * 0.78, h * 0.63, 6, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.beginPath();
      ctx.arc(w * 0.7, h * 0.58, 4, 0, Math.PI * 2);
      ctx.fill();

      // Floppy Ear
      ctx.fillStyle = "#b45309";
      ctx.beginPath();
      ctx.ellipse(w * 0.64, h * 0.62, w * 0.035, h * 0.07, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      ctx.fillStyle = "#d97706";
      ctx.fillRect(w * 0.4, h * 0.75, 18, 65);
      ctx.fillRect(w * 0.46, h * 0.75, 18, 65);
      ctx.fillRect(w * 0.58, h * 0.75, 18, 65);
      ctx.fillRect(w * 0.64, h * 0.75, 18, 65);

      // Tail
      ctx.lineWidth = 14;
      ctx.strokeStyle = "#d97706";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(w * 0.33, h * 0.68);
      ctx.quadraticCurveTo(w * 0.25, h * 0.62, w * 0.28, h * 0.52);
      ctx.stroke();

      // Red Collar
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(w * 0.62, h * 0.64, 18, 8);
    })
  );

  // 3. Person using a laptop with coffee
  samples.push(
    createSampleCanvasImage("person_laptop_coffee.jpg", 640, 480, (ctx, w, h) => {
      // Room wall
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(0, 0, w, h * 0.55);

      // Bookshelf / plant in corner
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(w * 0.05, h * 0.1, w * 0.2, h * 0.4);
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(w * 0.15, h * 0.18, 28, 0, Math.PI * 2);
      ctx.fill();

      // Wooden Desk
      const deskGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
      deskGrad.addColorStop(0, "#b45309");
      deskGrad.addColorStop(1, "#78350f");
      ctx.fillStyle = deskGrad;
      ctx.fillRect(0, h * 0.55, w, h * 0.45);

      // Person sitting behind desk
      // Torso / blue shirt
      ctx.fillStyle = "#2563eb";
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.58, w * 0.16, h * 0.22, 0, 0, Math.PI);
      ctx.fill();

      // Neck & Head
      ctx.fillStyle = "#fbcfe8";
      ctx.fillRect(w * 0.47, h * 0.32, w * 0.06, h * 0.08);
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.26, w * 0.075, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = "#3f3f46";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.24, w * 0.078, Math.PI, Math.PI * 2);
      ctx.fill();

      // Silver Laptop open on desk
      // Laptop Base
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.roundRect(w * 0.36, h * 0.72, w * 0.28, h * 0.08, 6);
      ctx.fill();
      // Trackpad
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(w * 0.47, h * 0.76, w * 0.06, h * 0.03);

      // Laptop Screen angled
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.roundRect(w * 0.38, h * 0.48, w * 0.24, h * 0.24, 6);
      ctx.fill();
      // Glow on screen (code lines)
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(w * 0.4, h * 0.51, w * 0.2, h * 0.18);
      ctx.fillStyle = "#0f172a";
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(w * 0.42, h * 0.54 + i * 14, w * 0.14 - (i % 2) * 20, 4);
      }

      // Hands on keyboard
      ctx.fillStyle = "#fbcfe8";
      ctx.beginPath();
      ctx.arc(w * 0.42, h * 0.74, 14, 0, Math.PI * 2);
      ctx.arc(w * 0.58, h * 0.74, 14, 0, Math.PI * 2);
      ctx.fill();

      // Ceramic White Coffee Mug on desk
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(w * 0.72, h * 0.68, w * 0.08, h * 0.14, 8);
      ctx.fill();
      // Coffee top
      ctx.fillStyle = "#451a03";
      ctx.beginPath();
      ctx.ellipse(w * 0.76, h * 0.7, w * 0.035, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Mug Handle
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(w * 0.81, h * 0.75, 14, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    })
  );

  // 4. Plate of delicious food / pasta
  samples.push(
    createSampleCanvasImage("plate_of_pasta_food.jpg", 640, 480, (ctx, w, h) => {
      // Restaurant table tablecloth
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, w, h);

      // Plaid pattern on cloth
      ctx.strokeStyle = "#fee2e2";
      ctx.lineWidth = 2;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Fork on left
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(w * 0.14, h * 0.35, 8, h * 0.35);
      for (let f = 0; f < 4; f++) {
        ctx.fillRect(w * 0.13 + f * 4, h * 0.28, 2, 35);
      }

      // Spoon on right
      ctx.fillRect(w * 0.82, h * 0.35, 8, h * 0.35);
      ctx.beginPath();
      ctx.ellipse(w * 0.824, h * 0.3, 14, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Large White Ceramic Plate
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.15)";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(w * 0.48, h * 0.5, w * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner Plate Rim
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(w * 0.48, h * 0.5, w * 0.22, 0, Math.PI * 2);
      ctx.stroke();

      // Golden Spaghetti Pasta Swirl
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#fde047";
      ctx.lineCap = "round";
      for (let s = 0; s < 12; s++) {
        ctx.beginPath();
        const rad = 25 + s * 6;
        ctx.arc(w * 0.48 + (s % 3) * 5, h * 0.5 + (s % 2) * 5, rad, s * 0.4, s * 0.4 + Math.PI * 1.3);
        ctx.stroke();
      }

      // Rich Red Tomato Marinara Sauce
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.arc(w * 0.48, h * 0.48, w * 0.09, 0, Math.PI * 2);
      ctx.fill();

      // Fresh Green Basil Leaves
      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.ellipse(w * 0.46, h * 0.45, 14, 8, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(w * 0.51, h * 0.47, 16, 9, 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Sprinkled Parmesan Cheese dots
      ctx.fillStyle = "#fef9c3";
      for (let p = 0; p < 18; p++) {
        ctx.beginPath();
        ctx.arc(
          w * 0.42 + (p * 23) % (w * 0.14),
          h * 0.43 + (p * 17) % (h * 0.12),
          2.5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    })
  );

  // 5. Urban City Skyline
  samples.push(
    createSampleCanvasImage("urban_city_skyline.jpg", 640, 480, (ctx, w, h) => {
      // Twilight Sky
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
      sky.addColorStop(0, "#0f172a");
      sky.addColorStop(0.5, "#1e1b4b");
      sky.addColorStop(1, "#f97316");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h * 0.7);

      // Water reflection
      const water = ctx.createLinearGradient(0, h * 0.7, 0, h);
      water.addColorStop(0, "#1e1b4b");
      water.addColorStop(1, "#020617");
      ctx.fillStyle = water;
      ctx.fillRect(0, h * 0.7, w, h * 0.3);

      // Skyscraper Silhouettes
      const buildings = [
        { x: 0.05, w: 0.1, h: 0.45, color: "#1e293b" },
        { x: 0.18, w: 0.08, h: 0.55, color: "#0f172a" },
        { x: 0.28, w: 0.12, h: 0.38, color: "#334155" },
        { x: 0.43, w: 0.14, h: 0.62, color: "#0f172a" }, // Spire building
        { x: 0.6, w: 0.11, h: 0.48, color: "#1e293b" },
        { x: 0.73, w: 0.13, h: 0.4, color: "#334155" },
        { x: 0.88, w: 0.09, h: 0.32, color: "#1e293b" },
      ];

      buildings.forEach((b) => {
        ctx.fillStyle = b.color;
        const bx = w * b.x;
        const bw = w * b.w;
        const bh = h * b.h;
        const by = h * 0.7 - bh;
        ctx.fillRect(bx, by, bw, bh);

        // Windows illuminated
        ctx.fillStyle = "#fef08a";
        for (let r = 0; r < Math.floor(bh / 18); r++) {
          for (let c = 0; c < Math.floor(bw / 14); c++) {
            if ((r + c) % 3 === 0) {
              ctx.fillRect(bx + 4 + c * 14, by + 6 + r * 18, 6, 8);
            }
          }
        }
      });

      // Spire on main tower
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(w * 0.495, h * 0.04, 5, h * 0.04);
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.04, 4, 0, Math.PI * 2);
      ctx.fill();
    })
  );

  // 6. Person wearing red shirt in a room
  samples.push(
    createSampleCanvasImage("person_red_shirt.jpg", 640, 480, (ctx, w, h) => {
      // Warm indoor studio
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, w, h);

      // Soft neutral backdrop
      const wallGrad = ctx.createLinearGradient(0, 0, w, h);
      wallGrad.addColorStop(0, "#e2e8f0");
      wallGrad.addColorStop(1, "#cbd5e1");
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, w, h);

      // Person Portrait
      // Vibrant Red Shirt / Clothing
      ctx.fillStyle = "#ef4444"; // Distinctive Red Shirt
      ctx.beginPath();
      ctx.moveTo(w * 0.28, h * 0.95);
      ctx.lineTo(w * 0.35, h * 0.56);
      ctx.lineTo(w * 0.45, h * 0.52);
      ctx.lineTo(w * 0.55, h * 0.52);
      ctx.lineTo(w * 0.65, h * 0.56);
      ctx.lineTo(w * 0.72, h * 0.95);
      ctx.closePath();
      ctx.fill();

      // Shirt collar details
      ctx.strokeStyle = "#b91c1c";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.45, h * 0.52);
      ctx.lineTo(w * 0.5, h * 0.62);
      ctx.lineTo(w * 0.55, h * 0.52);
      ctx.stroke();

      // Neck
      ctx.fillStyle = "#fed7aa";
      ctx.fillRect(w * 0.46, h * 0.42, w * 0.08, h * 0.12);

      // Face
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.32, w * 0.11, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = "#451a03";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.28, w * 0.115, Math.PI * 0.85, Math.PI * 2.15);
      ctx.fill();

      // Eyes
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(w * 0.46, h * 0.31, 4, 0, Math.PI * 2);
      ctx.arc(w * 0.54, h * 0.31, 4, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = "#9a3412";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.35, 14, 0.2, Math.PI - 0.2);
      ctx.stroke();
    })
  );

  return samples;
}
