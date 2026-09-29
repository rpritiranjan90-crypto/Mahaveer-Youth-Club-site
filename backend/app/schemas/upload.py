from typing import Optional
from pydantic import BaseModel, model_validator


class FileUploadResponse(BaseModel):
    filename: str
    url: str
    file_url: Optional[str] = None
    content_type: str
    size_bytes: int

    @model_validator(mode="after")
    def populate_file_url(self):
        if not self.file_url:
            self.file_url = self.url
        return self

