// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-07-11 13:39:17
// Current User's Login: MahmoudKebbi

// Payment Status Types
export const PaymentStatus = {
  COMPLETED: "completed",
  PENDING: "pending",
  CANCELED: "canceled",
};

// Payment Methods
export const PaymentMethod = {
  CASH: "cash",
  WHISH: "Whish",
  OTHER: "other",
};

// Membership Types with Prices
export const MembershipTypes = {
  TWO_DAYS_WEEKLY: {
    id: "two-days-weekly",
    name: "Basic",
    price: 20,
    daysPerWeek: 2,
    duration: 30, // days
    description: "Access to club facilities 2 days per week (non-coaching)",
    includesCoaching: false,
    features: [
      "Access to gym facilities",
      "Choose your days when visiting",
      "No coaching included",
    ],
    isActive: true,
    displayOrder: 1, // For consistent display order
  },
  THREE_DAYS_WEEKLY: {
    id: "three-days-weekly",
    name: "Standard",
    price: 40,
    daysPerWeek: 3,
    duration: 30, // days
    description: "Access to club facilities 3 days per week (non-coaching)",
    includesCoaching: false,
    features: [
      "Access to gym facilities",
      "Choose your days when visiting",
      "No coaching included",
      "Rackets and balls included",
    ],
    isActive: true,
    displayOrder: 2,
  },
  UNLIMITED: {
    id: "unlimited",
    name: "Premium",
    price: 60,
    daysPerWeek: 7,
    duration: 30, // days
    description: "Unlimited access to club facilities (non-coaching)",
    includesCoaching: true,
    features: [
      "Unlimited access to gym facilities",
      "Coaching included",
      "Progress tracking",
      "Rackets and balls included",
    ],
    isActive: true,
    displayOrder: 3,
  },
  COACHING: {
    id: "coaching",
    name: "Coaching",
    price: 40,
    daysPerWeek: 2,
    duration: 30, // days
    description: "Access to club facilities 2 days per week with coaching",
    includesCoaching: true,
    features: [
      "Access to gym facilities",
      "2 days per week with coaching",
      "Progress tracking",
      "Rackets and balls included",
    ],
    isActive: true,
    displayOrder: 4,
  },
};

// Session Pricing
export const SessionPricing = {
  PRIVATE_COACHING: {
    id: "private_coaching",
    name: "Private Coaching Session",
    price: 20,
    description: "One-on-one coaching session",
    features: [
      "Personalized training plan",
      "Progress tracking",
      "Flexible scheduling with coaches",
      "Rackets and balls included",
    ],
    displayOrder: 1,
  },
  NONE_COACHING_SINGLE: {
    id: "none_coaching_single",
    name: "Single Session (Non-Coaching)",
    price: 10,
    description: "Single access to club facilities without coaching",
    features: [
      "Access to gym facilities",
      "No coaching included",
      "Valid for one day",
      "2 Rackets and 2 Balls included",
    ],
    displayOrder: 2,
  },
};

// Helper function to calculate membership expiration
export const calculateMembershipExpiration = (
  membershipType,
  startDate = new Date(),
) => {
  const expiration = new Date(startDate);

  // Convert to uppercase and normalize format (replacing hyphens with underscores)
  const normalizedType = membershipType.toUpperCase().replace(/-/g, "_");
  const membership = MembershipTypes[normalizedType];

  if (!membership) return null;

  expiration.setDate(startDate.getDate() + membership.duration);
  return expiration;
};

// Helper to format currency
export const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Get membership status based on expiration date
export const getMembershipStatus = (expirationDate) => {
  if (!expirationDate) return "inactive";

  const now = new Date();
  const expiration =
    typeof expirationDate.toDate === "function"
      ? expirationDate.toDate() // Handle Firestore Timestamp
      : new Date(expirationDate);

  if (expiration > now) {
    return "active";
  } else {
    return "expired";
  }
};

// Get active membership types (for display in UI)
export const getActiveMembershipTypes = () => {
  return Object.values(MembershipTypes)
    .filter((type) => type.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
};

// Get membership days remaining
export const getMembershipDaysRemaining = (expirationDate) => {
  if (!expirationDate) return 0;

  const now = new Date();
  const expiration =
    typeof expirationDate.toDate === "function"
      ? expirationDate.toDate()
      : new Date(expirationDate);

  // If already expired
  if (expiration <= now) return 0;

  // Calculate days difference
  const diffTime = Math.abs(expiration - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get membership by ID
export const getMembershipById = (id) => {
  if (!id) return null;

  // Convert to uppercase and normalize format (replacing hyphens with underscores)
  const normalizedId = id.toUpperCase().replace(/-/g, "_");
  return MembershipTypes[normalizedId] || null;
};

// Format payment method for display
export const getPaymentMethodLabel = (method) => {
  switch (method) {
    case PaymentMethod.CASH:
      return "Cash";
    case PaymentMethod.BANK_TRANSFER:
      return "Bank Transfer";
    case PaymentMethod.OTHER:
      return "Other";
    default:
      return method;
  }
};
