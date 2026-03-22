import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    console.log("---------------------------------------");
    console.log("🚀 [WEBHOOK] Отримано новий запит від Cal.com!");

    try {
        const payload = await req.json();
        const eventType = payload.triggerEvent;
        const data = payload.payload;
        // console.log("📦 ВЕСЬ PAYLOAD:", JSON.stringify(data, null, 2));

        console.log("📡 Тип події:", eventType);

        // 🔍 ДИВИМОСЬ, ЯКІ ID ПРИЙШЛИ
        console.log("🆔 data.id (Числовий):", data.id);
        console.log("🆔 data.uid (Текстовий):", data.uid);

        // Шукаємо спочатку в bookingId (число), потім в id, а якщо немає - в uid (текст)
        const finalCalId = (data.bookingId || data.id || data.uid).toString();

        console.log("🎯 ТЕПЕР МИ ВЗЯЛИ ПРАВИЛЬНИЙ ID:", finalCalId);

        if (!finalCalId) {
            console.error("❌ Помилка: Cal.com не прислав жодного ID!");
            return NextResponse.json({ error: "No ID provided" }, { status: 400 });
        }

        const customerEmail = data.attendees?.[0]?.email;
        const masterEmail = data.organizer?.email || data.user?.email;

        if (!customerEmail) {
            return NextResponse.json({ error: "No email found" }, { status: 400 });
        }

        const [customerRes, masterRes] = await Promise.all([
            supabaseAdmin.from('profiles').select('id').eq('email', customerEmail).single(),
            masterEmail
                ? supabaseAdmin.from('profiles').select('id').eq('email', masterEmail).single()
                : Promise.resolve({ data: null })
        ]);

        if (customerRes.error || !customerRes.data) {
            console.log("⚠️ Клієнта не знайдено в базі. Запис ігнорується.");
            return NextResponse.json({ message: "Customer not found" }, { status: 200 });
        }

        const userId = customerRes.data.id;
        const masterId = masterRes.data?.id || null;

        if (
            eventType === 'BOOKING_CREATED' ||
            eventType === 'BOOKING_RESCHEDULED' ||
            eventType === 'BOOKING_REQUESTED'
        ) {
            let bookingStatus = 'confirmed';
            if (eventType === 'BOOKING_REQUESTED' || data.status === 'PENDING') {
                bookingStatus = 'pending';
            }

            const bookingData = {
                user_id: userId,
                master_id: masterId,
                cal_booking_id: finalCalId, // 👈 ЗАПИСУЄМО НАШ ЗНАЙДЕНИЙ ID
                event_title: data.type,
                start_time: data.startTime,
                end_time: data.endTime,
                master_name: data.organizer?.name || 'Foxy Master',
                status: bookingStatus,
                reschedule_url: data.rescheduleUrl,
                cancel_url: data.cancelUrl,
            };

            const { error: upsertError } = await supabaseAdmin
                .from('bookings')
                .upsert(bookingData, { onConflict: 'cal_booking_id' });

            if (upsertError) throw upsertError;
            console.log(`🎉 Запис збережено! Status: ${bookingStatus}, Cal ID: ${finalCalId}`);
        }

        if (eventType === 'BOOKING_CANCELLED' || eventType === 'BOOKING_REJECTED') {
            await supabaseAdmin
                .from('bookings')
                .update({ status: 'cancelled' })
                .eq('cal_booking_id', finalCalId);
            console.log("✅ Запис скасовано.");
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error("💥 КРИТИЧНА ПОМИЛКА ВЕБХУКА:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        console.log("---------------------------------------");
    }
}