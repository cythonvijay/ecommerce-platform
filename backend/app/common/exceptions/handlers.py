"""Global exception handlers registered on the FastAPI app instance."""
import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError

from app.core.exceptions import AppError

logger = logging.getLogger("ecommerce")


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError):
        logger.warning("AppError on %s: %s", request.url.path, exc.detail)
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "message": exc.detail, "detail": None},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={"success": False, "message": "Validation error", "detail": exc.errors()},
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(request: Request, exc: IntegrityError):
        logger.error("IntegrityError on %s: %s", request.url.path, str(exc.orig))
        return JSONResponse(
            status_code=409,
            content={"success": False, "message": "Database constraint violation", "detail": None},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception on %s", request.url.path)
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error", "detail": None},
        )
