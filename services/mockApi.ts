import { Request, Offer } from '../types';

const LS_KEYS = {
  requests: 'yolmov_requests',
  offers: 'yolmov_offers'
};

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function genId(prefix: string) {
  return prefix + '-' + Math.random().toString(36).slice(2, 9);
}

// REQUESTS
export function createMockRequest(partial: Omit<Request, 'id' | 'createdAt' | 'status'> & { status?: Request['status'] }): Request {
  const requests = load<Request>(LS_KEYS.requests);
  const req: Request = {
    id: genId('REQ'),
    createdAt: new Date().toISOString(),
    status: partial.status || 'open',
    ...partial
  };
  requests.push(req);
  save(LS_KEYS.requests, requests);
  return req;
}

export function getRequestsByCustomer(customerId: string): Request[] {
  return load<Request>(LS_KEYS.requests).filter(r => r.customerId === customerId);
}

export function updateRequestStatus(requestId: string, status: Request['status']) {
  const requests = load<Request>(LS_KEYS.requests);
  const idx = requests.findIndex(r => r.id === requestId);
  if (idx >= 0) {
    requests[idx].status = status;
    save(LS_KEYS.requests, requests);
  }
}

// OFFERS
export function createOffer(partnerId: string, requestId: string, data: Omit<Offer,'id'|'createdAt'|'status'|'partnerId'|'requestId'> & { status?: Offer['status'] }): Offer {
  const offers = load<Offer>(LS_KEYS.offers);
  const offer: Offer = {
    id: genId('OFF'),
    createdAt: new Date().toISOString(),
    status: data.status || 'sent',
    partnerId,
    requestId,
    price: data.price,
    etaMinutes: data.etaMinutes,
    message: data.message
  };
  offers.push(offer);
  save(LS_KEYS.offers, offers);
  return offer;
}

export function getOffersForRequest(requestId: string): Offer[] {
  return load<Offer>(LS_KEYS.offers).filter(o => o.requestId === requestId);
}

export function acceptOffer(offerId: string) {
  const offers = load<Offer>(LS_KEYS.offers);
  const offer = offers.find(o => o.id === offerId);
  if (!offer) return;
  offer.status = 'accepted';
  save(LS_KEYS.offers, offers);
  // request status -> matched
  updateRequestStatus(offer.requestId, 'matched');
  // diğer teklifler -> rejected
  offers.filter(o => o.requestId === offer.requestId && o.id !== offerId).forEach(o => o.status = 'rejected');
  save(LS_KEYS.offers, offers);
}

export function rejectOffer(offerId: string) {
  const offers = load<Offer>(LS_KEYS.offers);
  const offer = offers.find(o => o.id === offerId);
  if (!offer) return;
  offer.status = 'rejected';
  save(LS_KEYS.offers, offers);
}

export function withdrawOffer(offerId: string) {
  const offers = load<Offer>(LS_KEYS.offers);
  const offer = offers.find(o => o.id === offerId);
  if (!offer) return;
  offer.status = 'withdrawn';
  save(LS_KEYS.offers, offers);
}

// SEED helper (for development)
export function seedDemoRequests(customerId: string) {
  if (getRequestsByCustomer(customerId).length > 0) return; // already seeded
  createMockRequest({
    customerId,
    serviceType: 'cekici',
    description: 'Aracım çalışmıyor, çekici gerekiyor',
    fromLocation: 'Kadıköy, İstanbul',
    toLocation: 'Maltepe Servis',
    vehicleInfo: 'Renault Clio 2016'
  });
  createMockRequest({
    customerId,
    serviceType: 'aku',
    description: 'Akü tamamen bitti takviye gerekiyor',
    fromLocation: 'Beşiktaş, İstanbul',
    vehicleInfo: 'BMW 3.20 2019'
  });
}
