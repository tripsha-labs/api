import moment from 'moment';

export const getCosting = preferences => {
  // Room costing
  let totalRoomCost = 0;
  preferences.rooms &&
    preferences.rooms.forEach(room => {
      totalRoomCost += room.variant.cost;
    });
  totalRoomCost = totalRoomCost > 0 ? totalRoomCost.toFixed(2) : 0;
  totalRoomCost *= preferences.attendees;

  let discountedRoomCost = totalRoomCost;
  if (preferences.isDiscountApplicable && preferences.discount) {
    if (preferences.discount.discType === 'usd') {
      discountedRoomCost -= preferences.discount.amount;
    } else if (preferences.discount.discType === 'percentage') {
      discountedRoomCost -=
        (discountedRoomCost * preferences.discount.amount) / 100;
    }
  }

  // add on costing
  let totalAddOnCost = 0;
  preferences.addOns &&
    preferences.addOns.map(addOn => {
      if (addOn.selected) {
        totalAddOnCost += addOn.cost;
      }
      return addOn;
    });

  let discountedAddOnCost = totalAddOnCost;
  if (
    totalAddOnCost > 0 &&
    preferences.isDiscountApplicable &&
    preferences.discount &&
    preferences.discount.includeAddOns
  ) {
    if (preferences.discount.discType === 'usd') {
      discountedAddOnCost -= preferences.discount.amount;
    } else if (preferences.discount.discType === 'percentage') {
      discountedAddOnCost -=
        (preferences.discount.amount * discountedAddOnCost) / 100;
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
    if (preferences.deposit.includeAddOns) {
      paynowAmount = preferences.deposit.amount + discountedAddOnCost;
    } else {
      paynowAmount = preferences.deposit.amount;
    }
  } else {
    paynowAmount = discountedGrandTotal;
  }
  if (paynowAmount > discountedGrandTotal) {
    paynowAmount = discountedGrandTotal;
  }
  return {
    discountedTotalFare: discountedGrandTotal,
    totalFare: total,
    discountAddonFare: discountedAddOnCost,
    discountBaseFare: discountedRoomCost,
    totalBaseFare: totalRoomCost,
    totalAddonFare: totalAddOnCost,
    pendingAmout: discountedGrandTotal - paynowAmount,
    currentDue: paynowAmount,
  };
};
export const getDiscountStatus = trip => {
  if (
    trip.isDiscountApplicable &&
    trip.discounts.length > 0 &&
    trip.discounts[0].expirationDate
  ) {
    const expiration = moment(
      trip.discounts[0].expirationDate.toString(),
      'YYYYMMDD'
    );
    const today = moment(new Date(), 'YYYYMMDD');
    return expiration.diff(today, 'days') > -1;
  }
};
export const getDepositStatus = trip => {
  if (trip.isDepositApplicable && trip.deposit && trip.deposit.expirationDate) {
    const expiration = moment(
      trip.deposit.expirationDate.toString(),
      'YYYYMMDD'
    );
    const today = moment(new Date(), 'YYYYMMDD');
    return expiration.diff(today, 'days') >= 0;
  }
};
export const getBookingValidity = trip => {
  if (trip.lastBookingDate) {
    const expiration = moment(trip.lastBookingDate, 'YYYYMMDD');
    const today = moment(new Date(), 'YYYYMMDD');
    return expiration.diff(today, 'days') >= 0;
  } else if (trip.startDate) {
    const expiration = moment(trip.startDate, 'YYYYMMDD');
    const today = moment(new Date(), 'YYYYMMDD');
    return expiration.diff(today, 'days') >= 0;
  } else return false;
};
