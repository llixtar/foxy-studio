import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { calBookingId } = await req.json();
    console.log("---------------------------------------");
    console.log("🎯 ПОЧАТОК ПІДТВЕРДЖЕННЯ ID:", calBookingId);

    // 1. Шукаємо візит
    const { data: booking, error: bError } = await supabaseAdmin
      .from('bookings')
      .select('master_id')
      .eq('cal_booking_id', calBookingId)
      .single();

    if (bError || !booking) {
      console.error("❌ Візит не знайдено в базі");
      return NextResponse.json({ error: "Wizyta nie znaleziona w bazie" }, { status: 404 });
    }

    // 2. Шукаємо майстра (профіль)
    const { data: profile, error: pError } = await supabaseAdmin
      .from('profiles')
      .select('cal_api_key, email')
      .eq('id', booking.master_id)
      .single();

    // 🛡️ Перевіряємо чи є профіль і ключ
    if (pError || !profile || !profile.cal_api_key) {
      console.error("❌ Майстра не знайдено або ключ відсутній");
      return NextResponse.json({ error: "Błąd profilu mastera lub brak API Key" }, { status: 400 });
    }

    const apiKey = profile.cal_api_key.trim();
    console.log(`👤 Майстер: ${profile.email}`);
    
    // 3. Стукаємо в Cal.com (ПРАВИЛЬНИЙ МЕТОД ДЛЯ API v1)
    // Прибрали /confirm з кінця URL
    const calUrl = `https://api.cal.com/v1/bookings/${calBookingId}?apiKey=${apiKey}`;
    
    const calResponse = await fetch(calUrl, {
      method: 'PATCH', // Змінили POST на PATCH
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: "ACCEPTED" }) // Передаємо статус підтвердження
    });

    console.log("📡 Статус відповіді Cal.com:", calResponse.status);

    if (!calResponse.ok) {
      const errorText = await calResponse.text();
      console.error("❌ Cal.com повернув помилку:", errorText.slice(0, 200));
      
      return NextResponse.json({ 
        error: "Cal.com відхилив запит.", 
        details: errorText.slice(0, 200) 
      }, { status: 500 });
    }

    // 4. Оновлюємо статус в нашій базі
    await supabaseAdmin
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('cal_booking_id', calBookingId);

    console.log("✅ ПІДТВЕРДЖЕНО!");
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("💥 КРИТИЧНА ПОМИЛКА:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}