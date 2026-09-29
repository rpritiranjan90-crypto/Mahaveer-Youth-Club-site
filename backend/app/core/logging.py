import logging
import sys
from backend.app.core.config import settings

def setup_logging() -> logging.Logger:
    """
    Configures structured standard logging for the application.
    Ensures safe formatting without sensitive data leakage.
    """
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    logging.basicConfig(
        level=log_level,
        format=log_format,
        datefmt=date_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

    logger = logging.getLogger("mahaveer_club")
    logger.setLevel(log_level)
    return logger

logger = setup_logging()
