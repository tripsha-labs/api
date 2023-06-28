import moment from 'moment';

export const getCost = preferences => {
  // Calculate room cost
  let totalRoomCost = 0;
  preferences?.rooms &&
    preferences?.rooms.forEach(room => {
      totalRoomCost += room.variant.cost * room.attendees;
    });
  totalRoomCost = parseFloat(totalRoomCost > 0 ? totalRoomCost.toFixed(2) : 0);

  // Calculate discounted room cost
  let discountedRoomCost = totalRoomCost;
  if (preferences?.isDiscountApplicable && preferences?.discount) {
    if (preferences?.discount?.discType === 'amount') {
      discountedRoomCost = totalRoomCost - preferences.discount.amount;
    } else if (preferences?.discount?.discType === 'percentage') {
      discountedRoomCost =
        totalRoomCost -
        (discountedRoomCost * preferences?.discount?.amount) / 100;
    }
  }

  // Discount code
  if (preferences?.coupon) {
    if (preferences?.coupon.discType === 'amount') {
      discountedRoomCost = discountedRoomCost - preferences.coupon.amount;
    } else if (preferences?.coupon.discType === 'percentage') {
      discountedRoomCost =
        discountedRoomCost -
        (discountedRoomCost * preferences?.coupon.amount) / 100;
    }
  }

  // Calculate add-on cost
  let totalAddOnCost = 0;
  preferences?.addOns &&
    preferences.addOns.map(addOn => {
      totalAddOnCost += addOn.variant.cost * addOn.attendees;
      return addOn;
    });
  totalAddOnCost = parseFloat(
    totalAddOnCost > 0 ? totalAddOnCost.toFixed(2) : 0
  );
  let discountedAddOnCost = totalAddOnCost;
  if (
    discountedAddOnCost > 0 &&
    preferences?.isDiscountApplicable &&
    preferences?.discount &&
    preferences?.discount.includeAddOns
  ) {
    if (preferences.discount.discType === 'amount') {
      discountedAddOnCost = discountedAddOnCost - preferences.discount.amount;
    } else if (preferences.discount.discType === 'percentage') {
      discountedAddOnCost =
        discountedAddOnCost -
        (preferences.discount.amount * discountedAddOnCost) / 100;
    }
  }

  // Apply coupon
  if (preferences.coupon) {
    if (preferences.coupon.discType === 'amount') {
      discountedAddOnCost = discountedAddOnCost - preferences.coupon.amount;
    } else if (preferences?.coupon?.discType === 'percentage') {
      discountedAddOnCost =
        discountedAddOnCost -
        (discountedAddOnCost * preferences.coupon.amount) / 100;
    }
  }

  // Total before discount
  const total = totalAddOnCost + totalRoomCost;
  // Total discounted price
  const discountedGrandTotal = discountedAddOnCost + discountedRoomCost;
  let paynowAmount = discountedGrandTotal;
  if (
    preferences.paymentStatus === 'deposit' &&
    preferences.isDepositApplicable &&
    preferences.deposit
  ) {
    paynowAmount = preferences.deposit.amount * preferences.attendees;
    if (preferences.deposit.includeAddOns) {
      paynowAmount = paynowAmount + discountedAddOnCost;
    }
  } else {
    paynowAmount = discountedGrandTotal;
  }
  if (paynowAmount >= discountedGrandTotal) {
    paynowAmount = discountedGrandTotal;
  }
  return {
    discountedTotalFare: discountedGrandTotal,
    totalFare: total,
    discountAddonFare: discountedAddOnCost,
    discountBaseFare: discountedRoomCost,
    totalBaseFare: totalRoomCost,
    totalAddonFare: totalAddOnCost,
    pendingAmount: discountedGrandTotal - paynowAmount,
    currentDue: paynowAmount,
  };
};

export const getDiscountStatus = trip => {
  if (
    trip?.isDiscountApplicable &&
    trip?.discounts?.length > 0 &&
    trip?.discounts[0]?.expirationDate
  ) {
    const expiration = moment(
      trip.discounts[0].expirationDate.toString(),
      'YYYYMMDD'
    ).endOf('day');
    return expiration.diff(moment(), 'days') >= 0;
  } else return false;
};
export const getDepositStatus = trip => {
  if (
    trip?.isDepositApplicable &&
    trip?.deposit &&
    trip?.deposit?.expirationDate
  ) {
    const expiration = moment(
      trip?.deposit?.expirationDate.toString(),
      'YYYYMMDD'
    ).endOf('day');
    const startDate = moment(trip?.startDate?.toString(), 'YYYYMMDD').endOf(
      'day'
    );
    return (
      expiration.diff(moment(), 'days') >= 0 &&
      startDate.diff(moment(), 'days') >= 30
    );
  } else return false;
};
export const getBookingValidity = trip => {
  if (trip?.lastBookingDate) {
    const expiration = moment(trip.lastBookingDate, 'YYYYMMDD').endOf('day');
    return expiration.diff(moment(), 'days') >= 0;
  } else if (trip?.startDate) {
    const expiration = moment(trip.startDate, 'YYYYMMDD').endOf('day');
    return expiration.diff(moment(), 'days') >= 0;
  } else return false;
};
export const getTripResourceValidity = (trip, bookingData) => {
  const status = {
    rooms: false,
    addOns: false,
  };
  if (trip.tripPaymentType == 'pay') {
    const rooms = {};
    const addOns = {};
    bookingData.rooms?.map(room => {
      rooms[`${room.room.id}_${room.variant.id}`] = room.attendees;
      return room;
    });
    bookingData.addOns?.map(addOn => {
      addOns[addOn.id] = addOn.attendees;
      return addOn;
    });
    trip.rooms?.map(room => {
      room.variants?.map(variant => {
        if (
          rooms[`${room.id}_${variant.id}`] &&
          variant.available - (variant.reserved || 0) <
            rooms[`${room.id}_${variant.id}`]
        )
          status.rooms = true;
        return variant;
      });
      return room;
    });
    trip.addOns?.map(addOn => {
      if (
        addOns[addOn.id] &&
        addOn.available - (addOn.reserved || 0) < addOns[addOn.id]
      )
        status.addOns = true;
      return addOn;
    });
  }
  return status;
};
export const addRoomResources = (booking, trip, fields) => {
  const rooms = [];
  trip.rooms.forEach(room => {
    room['variants'] = room.variants.map(variant => {
      const foundVariant =
        booking?.rooms &&
        booking?.rooms.find(
          rm => rm.room.id == room.id && rm.variant.id == variant.id
        );
      console.log(foundVariant);
      if (foundVariant && fields?.length > 0) {
        if (fields.includes('filled'))
          variant['filled'] = variant?.filled
            ? variant?.filled + foundVariant.attendees
            : foundVariant.attendees;
        if (fields.includes('reserved'))
          variant['reserved'] = variant?.reserved
            ? variant?.reserved + foundVariant.attendees
            : foundVariant.attendees;
      }
      return variant;
    });
    rooms.push(room);
  });
  return rooms;
};
export const addAddonResources = (booking, trip, fields) => {
  const addOns = [];
  trip.addOns.forEach(addOn => {
    addOn['variants'] = addOn.variants.map(variant => {
      const foundVariant =
        booking?.addOns &&
        booking.addOns.find(
          rm => rm.addOn.id == addOn.id && rm.variant.id == variant.id
        );
      if (foundVariant && fields && fields.length > 0) {
        if (fields.includes('filled'))
          variant['filled'] = variant?.filled
            ? (variant?.filled || 0) + (foundVariant.attendees || 0)
            : foundVariant.attendees || 0;
        if (fields.includes('reserved'))
          variant['reserved'] = variant?.reserved
            ? (variant?.reserved || 0) + (foundVariant.attendees || 0)
            : foundVariant.attendees || 0;
      }
      return variant;
    });
    addOns.push(addOn);
  });
  return addOns;
};
export const removeRoomResources = (booking, trip, fields) => {
  const rooms = [];
  trip.rooms.forEach(room => {
    room['variants'] = room.variants.map(variant => {
      const foundVariant = booking?.rooms?.find(
        rm => rm.room.id == room.id && rm.variant.id == variant.id
      );
      if (foundVariant && fields?.length > 0) {
        if (fields.includes('filled')) {
          variant['filled'] =
            (variant?.filled || 0) - (foundVariant?.attendees || 0);
          variant['filled'] = variant?.filled > 0 ? variant?.filled : 0;
        }
        if (fields.includes('reserved')) {
          variant['reserved'] =
            (variant?.reserved || 0) - (foundVariant?.attendees || 0);
          variant['reserved'] = variant?.reserved > 0 ? variant?.reserved : 0;
        }
      }
      return variant;
    });
    rooms.push(room);
  });
  return rooms;
};
export const removeAddonResources = (booking, trip, fields) => {
  const addOns = [];
  trip.addOns.forEach(addOn => {
    addOn['variants'] = addOn.variants.map(variant => {
      const foundVariant = booking?.addOns?.find(
        rm => rm.addOn.id == addOn.id && rm.variant.id == variant.id
      );
      if (foundVariant && fields?.length > 0) {
        if (fields.includes('filled')) {
          variant['filled'] =
            (variant?.filled || 0) - (foundVariant?.attendees || 0);
          variant['filled'] = variant?.filled > 0 ? variant?.filled : 0;
        }
        if (fields.includes('reserved')) {
          variant['reserved'] =
            (variant?.reserved || 0) - (foundVariant?.attendees || 0);
          variant['reserved'] = variant?.reserved > 0 ? variant?.reserved : 0;
        }
      }
      return variant;
    });
    addOns.push(addOn);
  });

  return addOns;
};
