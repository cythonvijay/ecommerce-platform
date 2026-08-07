"""analytics endpoints are deferred to a follow-up step (not required for the
core storefront/checkout/admin flow requested first). Not mounted in the
v1 router; add and wire in when needed."""
from fastapi import APIRouter

router = APIRouter(prefix="/analytics", tags=["analytics (deferred)"])
