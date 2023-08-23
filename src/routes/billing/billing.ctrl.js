import { InvoiceItemModel, InvoiceModel } from '../../models';

export class BillingController {
  static async unbilledPayment(payload, user) {
    const invoice = await InvoiceModel.findOne({
      organizationId: payload.organization_id,
      status: 'draft',
    });
    if (invoice?._id) {
      return await InvoiceItemModel.aggregate([
        {
          $match: {
            invoiceId: invoice?._id,
          },
        },
        {
          $group: {
            _id: '$tripId',
            guestCount: { $sum: '$guestCount' },
            tripId: { $first: '$tripId' },
            invoiceId: { $first: '$invoiceId' },
            travelerCount: { $sum: '$travelerCount' },
          },
        },
        {
          $lookup: {
            from: 'trips',
            localField: 'tripId',
            foreignField: '_id',
            as: 'Trips',
          },
        },
        {
          $unwind: {
            path: '$Trips',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            tripId: 1,
            travelerCount: 1,
            guestCount: 1,
            'Trips.title': 1,
            createdAt: 1,
            updatedAt: 1,
            invoiceId: 1,
          },
        },
      ]);
    } else return [];
  }

  static async listInvoices(payload, user) {
    const invoices = await InvoiceModel.aggregate([
      {
        $match: {
          userId: user._id,
          status: { $ne: 'draft' },
        },
      },
    ]);
    return invoices;
  }

  static async getInvoice(invoiceId, user) {
    const invoice = await InvoiceModel.findById(invoiceId);
    const items = await InvoiceItemModel.aggregate([
      {
        $match: {
          invoiceId: invoice?._id,
        },
      },
      {
        $group: {
          _id: '$tripOwnerId',
          guestCount: { $sum: '$guestCount' },
          tripId: { $first: '$tripId' },
          invoiceId: { $first: '$invoiceId' },
          travelerCount: { $sum: '$travelerCount' },
        },
      },
      {
        $lookup: {
          from: 'trips',
          localField: 'tripId',
          foreignField: '_id',
          as: 'Trips',
        },
      },
      {
        $unwind: {
          path: '$Trips',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          tripId: 1,
          travelerCount: 1,
          guestCount: 1,
          'Trips.title': 1,
          createdAt: 1,
          updatedAt: 1,
          invoiceId: 1,
        },
      },
    ]);

    return { invoice, items };
  }
}
