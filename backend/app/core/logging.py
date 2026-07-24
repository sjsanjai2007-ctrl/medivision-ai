"""Structured logging setup using loguru."""
import sys

from loguru import logger


def setup_logging() -> None:
    logger.remove()
    logger.add(
        sys.stderr,
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        ),
        level="INFO",
        colorize=True,
    )
    logger.add(
        "logs/medivision_{time:YYYY-MM-DD}.log",
        rotation="00:00",
        retention="7 days",
        compression="gz",
        level="DEBUG",
        enqueue=True,
    )
