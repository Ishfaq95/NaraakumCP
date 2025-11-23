import moment from 'moment';
import { store } from '../../shared/redux/store';

interface TimeSlot {
  date: string;
  fullTime: string;
  start_time: string;
  end_time: string;
  availability_type_id: string;
  is_holiday: boolean;
  available: boolean;
  selected: boolean;
  is_booked: boolean;
}

interface TimeConfig {
  Id: string;
  CatServiceId: string;
  CatSpecialtyId: string;
  StartTime: string;
  EndTime: string;
  CatAvailabilityTypeId: string;
  ServiceProviderId: string;
  StartDate: string;
  EndDate: string;
  OrganizationId: string;
  ShowCareProviderInfo: boolean;
  ServiceProviderHolidays: string | null;
  UnavailableStartdate: string | null;
  UnavailableEnddate: string | null;
  UnavailableStartTime: string | null;
  UnavailableEndTime: string | null;
  BookedSlots: any[];
}

/**
 * Converts UTC date and time to local date and time in 24-hour format
 * @param utcDate - UTC date string (e.g., "2025-08-04T00:00:00.000Z")
 * @param utcTime - UTC time string in 24-hour format (e.g., "09:30")
 * @returns Object containing local date and time in 24-hour format
 */
export const convertUTCToLocalDateTime = (
  utcDate: string,
  utcTime: string
): { localDate: string; localTime: string } => {
  try {
    // Extract date part from UTC date string (remove timezone info)
    const datePart = utcDate.split('T')[0];
    
    // Create a UTC datetime string
    const utcDateTimeString = `${datePart}T${utcTime}:00.000Z`;
    
    // Create Date object from UTC string
    const utcDateTime = new Date(utcDateTimeString);
    
    // Convert to local timezone
    const localDateTime = new Date(utcDateTime.getTime());
    
    // Format local date as YYYY-MM-DD
    const localDate = localDateTime.toISOString().split('T')[0];
    
    // Format local time as HH:MM in 24-hour format
    const localTime = localDateTime.toTimeString().slice(0, 5);
    
    return {
      localDate,
      localTime
    };
  } catch (error) {
    console.error('Error converting UTC to local datetime:', error);
    // Return original values if conversion fails
    return {
      localDate: utcDate.split('T')[0],
      localTime: utcTime
    };
  }
};

/**
 * Converts local date and time to UTC date and time
 * @param localDate - Local date string in YYYY-MM-DD format (e.g., "2025-08-04")
 * @param localTime - Local time string in 24-hour format (e.g., "10:00")
 * @returns Object containing UTC date and time
 */
export const convertLocalToUTCDateTime = (
  localDate: string,
  localTime: string
): { utcDate: string; utcTime: string } => {
  try {
    // Create a local datetime string
    const localDateTimeString = `${localDate}T${localTime}:00`;
    
    // Create Date object from local string (browser will interpret as local time)
    const localDateTime = new Date(localDateTimeString);
    
    // Convert to UTC
    const utcDateTime = new Date(localDateTime.getTime());
    
    // Format UTC date as YYYY-MM-DD
    const utcDate = utcDateTime.toISOString().split('T')[0];
    
    // Format UTC time as HH:MM in 24-hour format
    const utcTime = utcDateTime.toISOString().split('T')[1].slice(0, 5);
    
    return {
      utcDate,
      utcTime
    };
  } catch (error) {
    console.error('Error converting local to UTC datetime:', error);
    // Return original values if conversion fails
    return {
      utcDate: localDate,
      utcTime: localTime
    };
  }
};

// Convert 24-hour time to 12-hour format
export const convertTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Convert UTC to local timezone
export const convertUTCToLocalTimezone = (
  dateString: string,
  timeString: string,
  timezone: string
): { date: string; time: string } => {
  const utcDateTime = new Date(`${dateString}T${timeString}:00Z`);

  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  const localDateTimeString = utcDateTime.toLocaleString('en-US', options);
  const [localDate, localTime] = localDateTimeString.split(', ');
  const [month, day, year] = localDate.split('/');
  const [hour, minute] = localTime.split(':');

  return {
    date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
    time: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
  };
};

// Generate time slots for a specific date only
export const generateSlotsForDate = (
  config: TimeConfig,
  targetDate: string, // YYYY-MM-DD format
  slotDurationMinutes: number = 60,
  targetTimeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): TimeSlot[] => {
  const {
    StartTime,
    EndTime,
    StartDate,
    EndDate,
    CatAvailabilityTypeId,
    BookedSlots
  } = config;
  // Check if target date is within the valid range
  const targetDateObj = new Date(targetDate);
  const startDateObj = new Date(StartDate);
  const endDateObj = new Date(EndDate);
  
  if (targetDateObj < startDateObj || targetDateObj > endDateObj) {
    return []; // Target date is outside the valid range
  }

  const holidays = config.ServiceProviderHolidays || '';
  const holidaySet = holidays ? new Set(holidays.split(',')) : new Set();

  // Convert UTC times to local timezone for the target date
  const startLocal = convertUTCToLocalTimezone(StartDate, StartTime, targetTimeZone);
  const endLocal = convertUTCToLocalTimezone(EndDate, EndTime, targetTimeZone);

  const [rangeStartHour, rangeStartMinute] = startLocal.time.split(':').map(Number);
  const [rangeEndHour, rangeEndMinute] = endLocal.time.split(':').map(Number);

  const rangeStartTotalMinutes = rangeStartHour * 60 + rangeStartMinute;
  let rangeEndTotalMinutes = rangeEndHour * 60 + rangeEndMinute;

  const isOvernight = rangeStartTotalMinutes > rangeEndTotalMinutes;
  if (isOvernight) {
    rangeEndTotalMinutes += 1440; // Add 24 hours in minutes
  }

  const slots: TimeSlot[] = [];
  const dayName = targetDateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const isHoliday = holidaySet.has(dayName);

  // Generate slots for the specific date only
  let currentTotalMinutes = 0;
  const maxIterations = 1440 / slotDurationMinutes; // 24 hours worth of slots

  for (let i = 0; i < maxIterations; i++) {
    const nextTotalMinutes = currentTotalMinutes + slotDurationMinutes;

    const formatTime = (totalMinutes: number): string => {
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const startTimeStr = formatTime(currentTotalMinutes);
    const endTimeStr = formatTime(nextTotalMinutes);
    const start12Hour = convertTo12Hour(startTimeStr);
    const end12Hour = convertTo12Hour(endTimeStr);

    let slotMinutes = currentTotalMinutes;
    if (isOvernight && slotMinutes < rangeStartTotalMinutes) {
      slotMinutes += 1440;
    }

    const isAvailable = !isHoliday && (
      slotMinutes >= rangeStartTotalMinutes && slotMinutes < rangeEndTotalMinutes
    );


    
    const isBooked = BookedSlots ? BookedSlots.some((slot: any) => {
      // Convert slot.SchedulingTime to local time before comparison
      const convertedSlotTime = convertUTCToLocalTimezone(targetDate, slot.SchedulingTime, targetTimeZone);
      return convertedSlotTime.time == startTimeStr;
    }) : false;

    slots.push({
      date: targetDate,
      fullTime: startTimeStr,
      start_time: start12Hour,
      end_time: end12Hour,
      availability_type_id: CatAvailabilityTypeId,
      is_holiday: isHoliday,
      available: isAvailable,
      selected: false,
      is_booked: isBooked
    });

    currentTotalMinutes = nextTotalMinutes;
  }

  return slots;
};

// Optimized version of getUniqueAvailableSlots
export const getUniqueAvailableSlotsOptimized = (
  schedules: TimeConfig[],
  slotTime: number,
  selectedDate: string,
  targetTimeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): TimeSlot[] => {
  const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
  
  // Generate slots only for the selected date from all schedules
  const mergedSlots = schedules.flatMap(config => 
    generateSlotsForDate(config, formattedDate, slotTime, targetTimeZone)
  );
  
  const uniqueSlots: TimeSlot[] = [];
  const seenSlots = new Set<string>();

  mergedSlots.forEach(slot => {
    const key = `${slot.fullTime}`;
    if (!seenSlots.has(key)) {
      seenSlots.add(key);
      uniqueSlots.push(slot);
    }
  });

  return uniqueSlots.sort((a, b) => {
    const fullTimeA = `${a.date} ${a.fullTime}`;
    const fullTimeB = `${b.date} ${b.fullTime}`;
    return new Date(fullTimeA).getTime() - new Date(fullTimeB).getTime();
  });
};

// Keep the original function for backward compatibility (but mark as deprecated)
/**
 * @deprecated Use generateSlotsForDate instead for better performance
 */
export const generateSlots = (
  config: any,
  slotDurationMinutes: number = 60,
  targetTimeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): TimeSlot[] => {
  const {
    StartTime,
    EndTime,
    StartDate,
    EndDate,
    CatAvailabilityTypeId,
  } = config;

  const holidays = config.ServiceProviderHolidays || '';

  const generateDynamicSlots = (): TimeSlot[] => {
    const startLocal = convertUTCToLocalTimezone(StartDate, StartTime, targetTimeZone);
    const endLocal = convertUTCToLocalTimezone(EndDate, EndTime, targetTimeZone);

    const [rangeStartHour, rangeStartMinute] = startLocal.time.split(':').map(Number);
    const [rangeEndHour, rangeEndMinute] = endLocal.time.split(':').map(Number);

    const rangeStartTotalMinutes = rangeStartHour * 60 + rangeStartMinute;
    let rangeEndTotalMinutes = rangeEndHour * 60 + rangeEndMinute;

    const isOvernight = rangeStartTotalMinutes > rangeEndTotalMinutes;
    if (isOvernight) {
      rangeEndTotalMinutes += 1440;
    }

    const slots: TimeSlot[] = [];
    const startDateObj = new Date(startLocal.date);
    const endDateObj = new Date(endLocal.date);
    let currentDate = new Date(startDateObj);
    const holidaySet = holidays ? new Set(holidays.split(',')) : new Set();

    while (currentDate <= endDateObj) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      const isHoliday = holidaySet.has(dayName);
      const formattedDate = currentDate.toISOString().split('T')[0];

      let currentTotalMinutes = 0;
      const maxIterations = 1440 / slotDurationMinutes;

      for (let i = 0; i < maxIterations; i++) {
        const nextTotalMinutes = currentTotalMinutes + slotDurationMinutes;

        const formatTime = (totalMinutes: number): string => {
          const hours = Math.floor(totalMinutes % 1440 / 60);
          const minutes = totalMinutes % 60;
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        };

        const startTimeStr = formatTime(currentTotalMinutes);
        const endTimeStr = formatTime(nextTotalMinutes);
        const start12Hour = convertTo12Hour(startTimeStr);
        const end12Hour = convertTo12Hour(endTimeStr);

        let slotMinutes = currentTotalMinutes;
        if (isOvernight && slotMinutes < rangeStartTotalMinutes) {
          slotMinutes += 1440;
        }

        const isAvailable = !isHoliday && (
          slotMinutes >= rangeStartTotalMinutes && slotMinutes < rangeEndTotalMinutes
        );

        slots.push({
          date: formattedDate,
          fullTime: startTimeStr,
          start_time: start12Hour,
          end_time: end12Hour,
          availability_type_id: CatAvailabilityTypeId,
          is_holiday: isHoliday,
          available: isAvailable,
          selected: false,
          is_booked: false
        });

        currentTotalMinutes = nextTotalMinutes;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  };

  return generateDynamicSlots();
};

// Keep original function for backward compatibility
export const getUniqueAvailableSlots = (
  schedules: TimeConfig[],
  slotTime: number,
  selectedDate: string
): TimeSlot[] => {
  const mergedSlots = schedules.flatMap(obj => generateSlots(obj, slotTime));
  
  const uniqueSlots: TimeSlot[] = [];
  const seenSlots = new Set<string>();
  
  const filteredSlots = mergedSlots.filter(obj => 
    obj.date === moment(selectedDate).format('YYYY-MM-DD')
  );

  filteredSlots.forEach(slot => {
    const key = `${slot.fullTime}`;
    if (!seenSlots.has(key)) {
      seenSlots.add(key);
      uniqueSlots.push(slot);
    }
  });

  return uniqueSlots.sort((a, b) => {
    const fullTimeA = `${a.date} ${a.fullTime}`;
    const fullTimeB = `${b.date} ${b.fullTime}`;
    return new Date(fullTimeA).getTime() - new Date(fullTimeB).getTime();
  });
};

export const convert24HourToEnglishTime = (timeString: string): string => {
  if (!timeString) return timeString;
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const generatePayloadforOrderMainBeforePayment = (CardArray: any, Patient: any) => {

  const selectedLocation = store.getState().root.booking.selectedLocation;
  const user = store.getState().root.user.user;
  const payload = CardArray
    .map((item: any) => {

      const schedulingDate = item.SchedulingDate;
      const schedulingTime = item.SchedulingTime;
      const { utcDate, utcTime } = convertLocalToUTCDateTime(schedulingDate, schedulingTime);
      let schedulingDateUTC = utcDate;
      let schedulingTimeUTC = utcTime;
      

      const payloadItem: any = {
        "OrganizationId": item.OrganizationId,
        "CatCategoryId": item.CatCategoryId,
        "CatServiceId": item.CatServiceId,
        "OrganizationServiceId": item.OrganizationServiceId,
        "CatCategoryTypeId": item.CatCategoryTypeId,
        "ServiceCharges": item.ServiceCharges,
        "ServiceProviderloginInfoId": item.ServiceProviderUserloginInfoId,
        "OrganizationSpecialtiesId": 0,
        "OrganizationPackageId": 0,
        "Quantity": item.Quantity,
        "SchedulingDate": schedulingDateUTC,
        "SchedulingTime": schedulingTimeUTC,
        "CatSchedulingAvailabilityTypeId": item.CatSchedulingAvailabilityTypeId,
        "AvailabilityId": item.AvailabilityId,
        "PatientUserProfileInfoId": Patient.PatientUserProfileInfoId,
        "TextDescription": "",
        "AudioDescription": "",
        "OrderAddress":selectedLocation ? selectedLocation?.address : "",
        "OrderAddressArea": "",
        "OrderAddressGoogleLocation": selectedLocation? selectedLocation?.latitude + "," + selectedLocation?.longitude : "",
        "UserLocationId": 0,
        "saveinAddress": false,
        "OrderByCareProviderId": user.Id
      };

      // Add CatSpecialtyId only if it exists
      if (item.CatSpecialtyId) {
        payloadItem.CatSpecialtyId = item.CatSpecialtyId;
      }

      return payloadItem;
    })
    .filter(Boolean);

  return payload
}