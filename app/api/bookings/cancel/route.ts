import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { calBookingId } = await req.json();
    console.log("🛑 ПОЧАТОК СКАСУВАННЯ ID:", calBookingId);

    // 1. Шукаємо візит і майстра
    const { data: booking, error: bError } = await supabaseAdmin
      .from('bookings')
      .select('master_id')
      .eq('cal_booking_id', calBookingId)
      .single();

    if (bError || !booking) {
      return NextResponse.json({ error: "Візит не знайдено" }, { status: 404 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('cal_api_key')
      .eq('id', booking.master_id)
      .single();

    if (!profile?.cal_api_key) {
      return NextResponse.json({ error: "Brak API Key" }, { status: 400 });
    }

    const apiKey = profile.cal_api_key.trim();

    // 2. Стукаємо в Cal.com (Метод скасування - DELETE)
    const calUrl = `https://api.cal.com/v1/bookings/${calBookingId}/cancel?apiKey=${apiKey}`;
    
    const calResponse = await fetch(calUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancellationReason: "Скасовано майстром через панель" })
    });

    if (!calResponse.ok) {
      const errorText = await calResponse.text();
      console.error("❌ Помилка скасування:", errorText);
      return NextResponse.json({ error: "Cal.com відмовив у скасуванні" }, { status: 500 });
    }

    // 3. Оновлюємо нашу базу
    await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('cal_booking_id', calBookingId);

    console.log("✅ СКАСОВАНО!");
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("💥 КРИТИЧНА ПОМИЛКА:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}