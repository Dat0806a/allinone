import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs/promises";
import { existsSync } from "fs";
import webpush from "web-push";

dotenv.config();

// Web Push setup
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:example@yourdomain.org",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} else {
  console.warn("VAPID keys are missing. Push notifications will not work.");
}

function getLocalNutritionFallback(query: string) {
  const norm = query.toLowerCase();
  const items: any[] = [];
  
  // Custom simple parsing rules for Vietnamese foods
  if (norm.includes("phở bò") || norm.includes("pho bo")) {
    items.push({
      name: "Phở bò",
      portion: "1 tô trung bình",
      calories: 450,
      protein: 22,
      carbs: 58,
      fat: 15,
      notes: "Ước lượng cho 1 tô phở bò chín tái"
    });
  }
  if (norm.includes("phở gà") || norm.includes("pho ga")) {
    items.push({
      name: "Phở gà lứt / Phở gà",
      portion: "1 tô",
      calories: 400,
      protein: 25,
      carbs: 55,
      fat: 10,
      notes: "Phở gà thường hoặc gà lứt xé"
    });
  }
  if (norm.includes("bánh mì") || norm.includes("banh mi") || norm.includes("bánh mỳ")) {
    let count = 1;
    if (norm.includes("2 bánh mì") || norm.includes("2 chiếc") || norm.includes("2 cái")) count = 2;
    items.push({
      name: "Bánh mì trứng / thịt",
      portion: `${count} ổ`,
      calories: 380 * count,
      protein: 12 * count,
      carbs: 45 * count,
      fat: 11 * count,
      notes: "Ước lượng bánh mì pate trứng hoặc chả lụa"
    });
  }
  
  // Check for eggs
  if (norm.includes("trứng") || norm.includes("trung") || norm.includes("egg")) {
    let count = 1;
    const match = norm.match(/(\d+)\s*(quả|trai|hột|hot|qua|quả trứng)/);
    if (match) {
      count = parseInt(match[1]) || 1;
    } else if (norm.includes("hai") || norm.includes("2 quả") || norm.includes("2 qa")) {
      count = 2;
    }
    items.push({
      name: "Trứng gà luộc/ốp la",
      portion: `${count} quả`,
      calories: 70 * count,
      protein: 6 * count,
      carbs: 0.5 * count,
      fat: 5 * count,
      notes: "Trứng gà cỡ vừa"
    });
  }
  
  // Check for milk
  if (norm.includes("sữa") || norm.includes("sua") || norm.includes("milk")) {
    items.push({
      name: "Sữa tươi / Ly sữa",
      portion: "1 ly (250ml)",
      calories: 130,
      protein: 7,
      carbs: 12,
      fat: 6,
      notes: "Sữa tươi ít đường"
    });
  }

  // Check for cơm gà
  if (norm.includes("cơm gà") || norm.includes("com ga")) {
    items.push({
      name: "Cơm đùi gà xối mỡ",
      portion: "1 dĩa",
      calories: 720,
      protein: 32,
      carbs: 85,
      fat: 26,
      notes: "Dĩa cơm đùi gà quay/xối mỡ đặc trưng"
    });
  }

  // Check for ức gà
  if (norm.includes("ức gà") || norm.includes("uc ga")) {
    let weight = "200g";
    let multiplier = 2;
    if (norm.includes("100g")) { weight = "100g"; multiplier = 1; }
    else if (norm.includes("300g")) { weight = "300g"; multiplier = 3; }
    items.push({
      name: "Ức gà áp chảo / luộc",
      portion: weight,
      calories: 165 * multiplier,
      protein: 31 * multiplier,
      carbs: 0,
      fat: 3.6 * multiplier,
      notes: "Thực phẩm giàu protein cho người tập luyện"
    });
  }

  // Check for coca / soda
  if (norm.includes("coca") || norm.includes("coke") || norm.includes("nước ngọt")) {
    let count = 1;
    if (norm.includes("2 lon") || norm.includes("2 chai")) count = 2;
    items.push({
      name: "Nước ngọt có ga",
      portion: `${count} lon (320ml)`,
      calories: 140 * count,
      protein: 0,
      carbs: 39 * count,
      fat: 0,
      notes: "Chứa lượng đường cao"
    });
  }

  // Check for trà sữa
  if (norm.includes("trà sữa") || norm.includes("tra sua")) {
    items.push({
      name: "Trà sữa trân châu",
      portion: "1 ly lớn",
      calories: 450,
      protein: 4,
      carbs: 72,
      fat: 15,
      notes: "Nêu hạn chế dùng khi ăn kiêng"
    });
  }

  // Default item if queries didn't match anything
  if (items.length === 0) {
    items.push({
      name: query.trim(),
      portion: "1 phần ăn thường",
      calories: 350,
      protein: 15,
      carbs: 45,
      fat: 10,
      notes: "Ước lượng mặc định do chưa nhận dạng được món ăn đặc thù"
    });
  }

  // Calculate totals
  const totalCalories = items.reduce((sum, i) => sum + i.calories, 0);
  const totalProtein = Number(items.reduce((sum, i) => sum + i.protein, 0).toFixed(1));
  const totalCarbs = Number(items.reduce((sum, i) => sum + i.carbs, 0).toFixed(1));
  const totalFat = Number(items.reduce((sum, i) => sum + i.fat, 0).toFixed(1));

  return {
    items,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Path to the local JSON bookings database
  const bookingsFile = path.join(process.cwd(), "bookings.json");
  const medsFile = path.join(process.cwd(), "medicines.json");
  const subscriptionsFile = path.join(process.cwd(), "subscriptions.json");

  // Helper functions for JSON database
  async function readJson(file: string): Promise<any[]> {
    try {
      if (!existsSync(file)) return [];
      const raw = await fs.readFile(file, "utf-8");
      return JSON.parse(raw || "[]");
    } catch (e) {
      console.error(`Error reading ${file}:`, e);
      return [];
    }
  }

  async function writeJson(file: string, data: any[]): Promise<void> {
    try {
      await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error(`Error writing ${file}:`, e);
    }
  }

  async function readBookings(): Promise<any[]> {
    return readJson(bookingsFile);
  }

  async function writeBookings(data: any[]): Promise<void> {
    return writeJson(bookingsFile, data);
  }

  // API - Push Subscription
  app.post("/api/notifications/subscribe", async (req, res) => {
    try {
      const { subscription, userId } = req.body;
      if (!subscription) return res.status(400).json({ error: "Subscription missing" });

      const subs = await readJson(subscriptionsFile);
      // Avoid duplicate subscriptions for same endpoint
      const filtered = subs.filter(s => s.subscription.endpoint !== subscription.endpoint);
      filtered.push({ subscription, userId: userId || "anonymous", createdAt: new Date().toISOString() });
      await writeJson(subscriptionsFile, filtered);

      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Subscribe error:", error);
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  // API - Medications
  app.get("/api/medicines", async (req, res) => {
    const { userId } = req.query;
    const allMeds = await readJson(medsFile);
    const userMeds = userId ? allMeds.filter(m => m.userId === userId) : allMeds;
    res.json(userMeds);
  });

  app.post("/api/medicines", async (req, res) => {
    const { medicine, userId } = req.body;
    const allMeds = await readJson(medsFile);
    const newMed = { ...medicine, userId: userId || "anonymous", id: Date.now().toString() };
    allMeds.push(newMed);
    await writeJson(medsFile, allMeds);
    res.status(201).json(newMed);
  });

  app.delete("/api/medicines/:id", async (req, res) => {
    const { id } = req.params;
    const allMeds = await readJson(medsFile);
    const filtered = allMeds.filter(m => m.id !== id);
    await writeJson(medsFile, filtered);
    res.json({ success: true });
  });

  // API - Mark record as taken
  app.post("/api/medicines/record", async (req, res) => {
    try {
      const { medId, time, date, userId } = req.body;
      const recordsFile = path.join(process.cwd(), "medication_records.json");
      const allRecords = await readJson(recordsFile);
      
      const newRecord = {
        medId,
        time,
        date,
        userId: userId || "anonymous",
        takenAt: Date.now()
      };
      
      allRecords.push(newRecord);
      await writeJson(recordsFile, allRecords);
      res.status(201).json(newRecord);
    } catch (e) {
      res.status(500).json({ error: "Failed to save record" });
    }
  });

  // Background Task: Check for medication reminders every minute
  setInterval(async () => {
    try {
      const now = new Date();
      // Adjust to UTC+7 if needed, but let's assume server and user are in same zone or using UTC
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${h}:${m}`;

      const allMeds = await readJson(medsFile);
      const allSubs = await readJson(subscriptionsFile);

      // Group meds by userId
      const userReminders: Record<string, string[]> = {};
      allMeds.forEach(med => {
        if (med.times && med.times.includes(currentTimeStr)) {
          const uid = med.userId || "anonymous";
          if (!userReminders[uid]) userReminders[uid] = [];
          userReminders[uid].push(med.name);
        }
      });

      // For each user with a reminder, send push notification to all their subscriptions
      for (const [userId, meds] of Object.entries(userReminders)) {
        const userSubs = allSubs.filter(s => s.userId === userId);
        const payload = JSON.stringify({
          title: "Đến giờ uống thuốc",
          body: `Bạn cần uống: ${meds.join(", ")}`,
          url: "/medications"
        });

        userSubs.forEach(sub => {
          webpush.sendNotification(sub.subscription, payload).catch(err => {
            console.error(`Push failed for user ${userId}:`, err.statusCode);
            // If subscription is expired/invalid, we should ideally remove it
          });
        });
      }
    } catch (e) {
      console.error("Reminder interval error:", e);
    }
  }, 60000); // Once per minute

  // GET /api/bookings - Lấy danh sách lịch hẹn đặt xét nghiệm
  app.get("/api/bookings", async (req, res) => {
    try {
      const { userId } = req.query;
      const bookings = await readBookings();
      
      // Filter by userId if provided
      const userBookings = userId 
        ? bookings.filter(b => b.userId === userId)
        : bookings;

      // Sort bookings: new ones first
      userBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(userBookings);
    } catch (error: any) {
      console.error("GET Bookings Error:", error);
      res.status(500).json({ success: false, message: "Lỗi tải danh sách đặt lịch" });
    }
  });

  // POST /api/bookings - Xử lý đặt lịch xét nghiệm mới
  app.post("/api/bookings", async (req, res) => {
    try {
      const { fullName, phone, email, testDate, testTime, testType, notes, userId } = req.body;
      const errors: Record<string, string> = {};

      // 1. Validation - Họ và tên
      if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
        errors.fullName = "Họ và tên phải dài từ 2 ký tự trở lên";
      }

      // 2. Validation - Số điện thoại (chuẩn 10 chữ số của Việt Nam)
      const phoneRegex = /^0\d{9}$/;
      if (!phone || !phoneRegex.test(phone.trim())) {
        errors.phone = "Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 chữ số bắt đầu bằng số 0 (ví dụ: 0912345678).";
      }

      // 3. Validation - Email (nếu nhập thì phải đúng định dạng)
      if (email && typeof email === "string" && email.trim().length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          errors.email = "Địa chỉ email không đúng định dạng (ví dụ: ten@gmail.com)";
        }
      }

      // 4. Validation - Ngày xét nghiệm (không được chọn ngày trong quá khứ)
      if (!testDate) {
        errors.testDate = "Vui lòng chọn ngày hẹn lấy mẫu xét nghiệm";
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(testDate);
        if (isNaN(selected.getTime())) {
          errors.testDate = "Ngày xét nghiệm không hợp lệ";
        } else if (selected < today) {
          errors.testDate = "Không cho phép đặt lịch vào các ngày trong quá khứ";
        }
      }

      // 5. Validation - Khung giờ xét nghiệm (giờ hành chính 07:00 - 18:00)
      if (!testTime) {
        errors.testTime = "Vui lòng chọn khung giờ hẹn";
      } else {
        const [hours, minutes] = testTime.split(":").map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
          errors.testTime = "Giờ hẹn không hợp lệ";
        } else {
          const tVal = hours * 60 + minutes;
          const openVal = 7 * 60; // 07:00
          const closeVal = 18 * 60; // 18:00
          if (tVal < openVal || tVal > closeVal) {
            errors.testTime = "Giờ lấy mẫu phải trong khung giờ hoạt động (07:00 - 18:00)";
          }
        }
      }

      // 6. Validation - Loại xét nghiệm
      if (!testType || typeof testType !== "string" || testType.trim().length === 0) {
        errors.testType = "Vui lòng chọn loại xét nghiệm phù hợp";
      }

      // Nếu có lỗi validation, trả về response chi tiết
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Thông tin đặt lịch chưa hợp lệ. Vui lòng kiểm tra lại.",
          errors
        });
      }

      // 7. Tạo đối tượng booking và lưu vào database (JSON)
      const testTypesMap: Record<string, string> = {
        "blood": "Xét nghiệm máu tổng quát",
        "diabetes": "Xét nghiệm tiểu đường (HbA1c)",
        "liver_kidney": "Xét nghiệm chức năng Gan & Thận",
        "gout_lipid": "Tầm soát Gút & Mỡ máu",
        "geriatric": "Khám sức khỏe tổng quát dưỡng lão"
      };

      const resolvedTestTypeName = testTypesMap[testType] || testType;

      const newBooking = {
        id: "BK_" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        userId: userId || "anonymous",
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : "",
        testDate,
        testTime,
        testType: resolvedTestTypeName,
        notes: notes ? notes.trim() : "",
        status: "pending", // pending, confirmed, completed, cancelled
        createdAt: new Date().toISOString()
      };

      const allBookings = await readBookings();
      allBookings.push(newBooking);
      await writeBookings(allBookings);

      res.status(201).json({
        success: true,
        message: "Đặt lịch thành công! Đội ngũ y tế của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận hành trình.",
        booking: newBooking,
        bookingId: newBooking.id
      });
    } catch (error: any) {
      console.error("POST Booking Error:", error);
      res.status(500).json({
        success: false,
        message: "Hệ thống đang gặp sự cố khi xử lý đặt lịch. Vui lòng thử lại sau giây lát."
      });
    }
  });

  // Gemini API Initialization
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Chat API route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        history: history || [],
        config: {
          systemInstruction: "You are a helpful and caring health assistant. Always address the user as 'bạn' and keep a friendly, supportive tone. Focus on wellness and empathy. Always suggest consulting a doctor for serious medical concerns.",
        },
      });

      const result = await chat.sendMessage({ message });
      const text = result.text;

      res.json({ text });
    } catch (error: any) {
      console.error("Chat API Error:", error);
      res.status(500).json({ error: error.message || "Failed to get AI response" });
    }
  });

  // Nutrition Analyze API route using structured JSON
  app.post("/api/nutrition/analyze", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Yêu cầu cung cấp nội dung món ăn (query)" });
      }

      // Check if GEMINI_API_KEY is configured
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is missing, using high-quality local rules fallback");
        const fallbackResult = getLocalNutritionFallback(query);
        return res.json(fallbackResult);
      }

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            description: "Danh sách món ăn hoặc nguyên liệu bóc tách được từ văn bản.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: "Tên món ăn hoặc thành phần (ví dụ: Phở bò, Trứng gà, Trà sữa)"
                },
                portion: {
                  type: Type.STRING,
                  description: "Khẩu phần hoặc số lượng (ví dụ: 1 tô, 2 quả, 1 ly, 200g)"
                },
                calories: {
                  type: Type.INTEGER,
                  description: "Lượng calo uớc lượng (kcal)"
                },
                protein: {
                  type: Type.NUMBER,
                  description: "Lượng protein ước lượng (g)"
                },
                carbs: {
                  type: Type.NUMBER,
                  description: "Lượng carbohydrate ước lượng (g)"
                },
                fat: {
                  type: Type.NUMBER,
                  description: "Lượng chất béo (fat) ước lượng (g)"
                },
                notes: {
                  type: Type.STRING,
                  description: "Chú thích ngắn (ví dụ: Calo ước lượng trung bình của 2 quả trứng gà luộc, bằng Tiếng Việt)"
                }
              },
              required: ["name", "portion", "calories", "protein", "carbs", "fat"]
            }
          },
          totalCalories: {
            type: Type.INTEGER,
            description: "Tổng năng lượng kcal của tất cả món cộng lại"
          },
          totalProtein: {
            type: Type.NUMBER,
            description: "Tổng đạm protein (g)"
          },
          totalCarbs: {
            type: Type.NUMBER,
            description: "Tổng đường mạch carbs (g)"
          },
          totalFat: {
            type: Type.NUMBER,
            description: "Tổng chất béo fat (g)"
          }
        },
        required: ["items", "totalCalories", "totalProtein", "totalCarbs", "totalFat"]
      };

      const systemInstruction = "Bạn là chuyên gia dinh dưỡng thể thao và chuyển hóa tại Việt Nam. " +
        "Nhiệm vụ của bạn là bóc tách câu văn tự nhiên của người dùng lưu trữ lượng thức ăn họ ăn thành từng thành phần khác nhau, " +
        "sau đó ước tính khối lượng món ăn phổ biến ở Việt Nam và trả về calo (kcal), protein (g), carbs (g), fat (g) tương đối. " +
        "Hãy phản hồi CHỈ bằng định dạng JSON đã cấu trúc sẵn.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Phân tích món ăn và tính calo: "${query}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Không có phản hồi từ mô hình AI");
      }

      const parsed = JSON.parse(text);
      res.json(parsed);

    } catch (error: any) {
      console.error("Nutrition Analysis API Error:", error);
      const fallbackResult = getLocalNutritionFallback(req.body.query || "");
      res.json(fallbackResult);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
