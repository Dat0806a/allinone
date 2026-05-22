# Kiến trúc Hệ thống Nhắc nhở Uống thuốc Real-time (Timezone-Aware)

Để đảm bảo thông báo nhắc nhở uống thuốc luôn chính xác, hoạt động ở chế độ nền, và tự động đồng bộ khi người dùng di chuyển sang múi giờ khác, hệ thống cần được thiết kế với kiến trúc **Client-Server Timezone-Aware** kết hợp với **Local Scheduling**.

## 1. Data Model (Lưu trữ)

Tất cả thời gian nhắc nhở phải được chuẩn hóa về **UTC** trước khi lưu trữ (kể cả Local Storage hay Database).

```typescript
interface MedicationSchedule {
  id: string;
  name: string;
  dose: string;
  // Thời gian uống trong ngày theo UTC (vd: "01:00" UTC thay vì "08:00" +07:00)
  timesUTC: string[];  
  note?: string;
  startDate: string; // ISO 8601 UTC
  endDate?: string;
}

interface UserProfile {
  id: string;
  currentTimeZone: string; // Ví dụ: "Asia/Ho_Chi_Minh"
  lastLocationLat?: number;
  lastLocationLng?: number;
}
```

## 2. Luồng xử lý (Flow)

### A. Người dùng tạo lịch uống thuốc mới
1. User chọn giờ uống theo giờ địa phương (VD: 08:00 AM tại Việt Nam GMT+7).
2. App lấy múi giờ hiện tại của thiết bị thông qua `Intl.DateTimeFormat().resolvedOptions().timeZone` hoặc GPS.
3. App convert `08:00 (GMT+7)` thành `01:00 (UTC)` và lưu vào database/local storage.

### B. Cơ chế Notification (Real-time & Background)
Để đảm bảo không trễ hẹn và hoạt động khi app tắt, chúng ta sử dụng cơ chế Native Scheduler tùy nền tảng:

*   **Với React Native / Android Native:**
    1. Khi tải lịch từ DB (UTC), tính toán thời gian chạy tiếp theo dựa trên UTC.
    2. Chuyển thời gian UTC đó sang UNIX Timestamp.
    3. Đăng ký thông báo vào hàng đợi của hệ điều hành:
        - Android: Dùng `AlarmManager` (chính xác từng giây) kết hợp với `BroadcastReceiver` (để hiện popup và chuông). `WorkManager` không phù hợp cho exact timing vì có delay rải rác.
        - iOS: Dùng `UNUserNotificationCenter` để đưa vào local notification.
*   **Với Web PWA:**
    1. Service Worker được đăng ký.
    2. Sử dụng Push API (qua một Push Server - Firebase Cloud Messaging) để push từ backend. 
    3. Backend chạy Cronjob mỗi phút so sánh giờ UTC hiện tại với `timesUTC` trên DB. Nếu khớp, bắn FCM Push Notification xuống Web PWA. Service Worker nhận sự kiện `push` và gọi `showNotification`.

### C. Xử lý khi User thay đổi múi giờ (Du lịch)
1. Ứng dụng lắng nghe sự kiện `TIMEZONE_CHANGED` (trên Native OS) hoặc mỗi lần mở app (trên Web).
2. Kiểm tra `currentTimeZone` hiện tại so với lúc lưu.
3. Vì dữ liệu gốc là UTC, thời điểm phát chuông ở hệ thống cũ (ví dụ 01:00 UTC) tự động được hệ điều hành (Native) convert qua giờ local mới (nếu lịch đã dùng UNIX timestamp sẽ không bị ảnh hưởng). 
4. Cập nhật lại UI để hiển thị thời gian mới cho user (01:00 UTC -> 10:00 sáng tại Nhật GMT+9 thay vì 08:00 ở VN).

## 3. Best Practices & Xử lý Edge Cases

1. **Sai lệch đồng hồ hệ thống:** 
    - Nếu có backend, khi mở app luôn so sánh thời gian của máy (`Date.now()`) với thời gian server. Nếu lệch quá 1 phút, hiển thị cảnh báo yêu cầu user bật "Cập nhật giờ tự động".
2. **Device Restart:**
    - (Android) Đăng ký `RECEIVE_BOOT_COMPLETED` trong `AndroidManifest.xml`. Khi máy khởi động lại, OS sẽ gọi Broadcast này, App tự động lặp qua DB và đăng ký lại toàn bộ `AlarmManager`.
3. **Snooze (Nhắc lại):**
    - Khi bấm Nhắc lại (10 phút), tạo mới một Alarm với timestamp `Current UNIX + 600` và đánh dấu tag là `Snooze`.  
4. **Reliability vượt lên Accuracy:**
    - Nhắc thuốc quan trọng hơn việc siêu chính xác. Trên Android, một số hãng (Xiaomi, Oppo) giết app ngầm rất mạnh. Cần hướng dẫn user tắt tiết kiệm pin cho app, và bắt buộc kết hợp dùng FCM (High Priority Push) như một lớp fallback thứ 2.

## 4. Hiện thực Code trong App:
App đã được thiết lập Service Worker (`public/sw.js`) để xử lý các event Push (giả lập) và local notification. Trong codebase hook `useMedications`, chúng ta sử dụng `setInterval` để giả lập đồng hồ real-time kết hợp với API `Notification`, đảm bảo App có thể kêu chuông và gửi popup cảnh báo.
