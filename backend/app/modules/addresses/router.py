from typing import List
from fastapi import APIRouter, Depends, status

from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.addresses.dependencies import get_address_service
from app.modules.addresses.schemas import AddressCreate, AddressUpdate, AddressOut
from app.modules.addresses.service import AddressService

router = APIRouter(prefix="/addresses", tags=["Addresses"])


@router.get("", response_model=List[AddressOut])
def list_addresses(current_user: User = Depends(get_current_user), service: AddressService = Depends(get_address_service)):
    return service.list_for_user(current_user.id)


@router.post("", response_model=AddressOut, status_code=status.HTTP_201_CREATED)
def create_address(
    payload: AddressCreate,
    current_user: User = Depends(get_current_user),
    service: AddressService = Depends(get_address_service),
):
    return service.create(current_user.id, payload)


@router.put("/{address_id}", response_model=AddressOut)
def update_address(
    address_id: int,
    payload: AddressUpdate,
    current_user: User = Depends(get_current_user),
    service: AddressService = Depends(get_address_service),
):
    return service.update(address_id, current_user.id, payload)


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    service: AddressService = Depends(get_address_service),
):
    service.delete(address_id, current_user.id)
    return None
