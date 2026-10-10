function mapAddress(addr) {
  if (!addr) return null;
  const { id, userId, ...rest } = addr;
  return { _id: id, ...rest };
}

function mapCategory(cat) {
  if (!cat) return null;
  const { id, imageUrl, imagePublicId, ...rest } = cat;
  return {
    _id: id,
    ...rest,
    image: { url: imageUrl || null, publicId: imagePublicId || null },
  };
}

function mapProduct(product) {
  if (!product) return null;
  const { id, categoryId, images, compatibleVehicles, category, ...rest } = product;
  return {
    _id: id,
    ...rest,
    images: (images || []).map((img) => ({ url: img.url, publicId: img.publicId })),
    compatibleVehicles: (compatibleVehicles || []).map((v) => ({
      make: v.make,
      model: v.model,
      yearFrom: v.yearFrom,
      yearTo: v.yearTo,
    })),
    category: category ? mapCategory(category) : categoryId,
  };
}

function mapUser(user) {
  if (!user) return null;
  const { id, password, addresses, ...rest } = user;
  return {
    _id: id,
    ...rest,
    addresses: (addresses || []).map(mapAddress),
  };
}

function mapOrder(order) {
  if (!order) return null;
  const {
    id,
    userId,
    recipientName,
    street,
    city,
    region,
    commune,
    postalCode,
    shippingPhone,
    items,
    statusHistory,
    user,
    ...rest
  } = order;
  return {
    _id: id,
    ...rest,
    user: user ? mapUser(user) : userId,
    items: (items || []).map((item) => ({
      _id: item.id,
      product: item.product ? mapProduct(item.product) : item.productId,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    })),
    shippingAddress: {
      recipientName,
      street,
      city,
      region,
      commune,
      postalCode,
      phone: shippingPhone,
    },
    statusHistory: (statusHistory || []).map((h) => ({
      status: h.status,
      note: h.note,
      changedAt: h.changedAt,
    })),
  };
}

module.exports = { mapUser, mapAddress, mapCategory, mapProduct, mapOrder };
