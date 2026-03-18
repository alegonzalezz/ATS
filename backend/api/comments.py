from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
import uuid

MAX_COMMENTS = 5
MAX_COMMENT_SIZE = 50


@dataclass
class Comment:
    id: str
    applicant_id: str
    recruiter_id: str
    comment: str
    created_at: str
    updated_at: Optional[str] = None

    def to_dict(self):
        return {
            "id": self.id,
            "applicant_id": self.applicant_id,
            "recruiter_id": self.recruiter_id,
            "comment": self.comment,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @staticmethod
    def from_dict(data: dict):
        return Comment(
            id=data.get("id", str(uuid.uuid4())),
            applicant_id=data["applicant_id"],
            recruiter_id=data["recruiter_id"],
            comment=data["comment"],
            created_at=data.get("created_at", datetime.utcnow().isoformat()),
            updated_at=data.get("updated_at"),
        )


comments_db: list[Comment] = []


def create_comment(applicant_id: str, recruiter_id: str, comment: str) -> Comment:
    if len(comment) > MAX_COMMENT_SIZE:
        raise ValueError(f"Comment exceeds maximum length of {MAX_COMMENT_SIZE} characters")

    new_comment = Comment(
        id=str(uuid.uuid4()),
        applicant_id=applicant_id,
        recruiter_id=recruiter_id,
        comment=comment,
        created_at=datetime.utcnow().isoformat(),
    )
    comments_db.append(new_comment)
    return new_comment


def update_comment(comment_id: str, comment: str) -> Optional[Comment]:
    if len(comment) > MAX_COMMENT_SIZE:
        raise ValueError(f"Comment exceeds maximum length of {MAX_COMMENT_SIZE} characters")

    for c in comments_db:
        if c.id == comment_id:
            c.comment = comment
            c.updated_at = datetime.utcnow().isoformat()
            return c
    return None


def delete_comment(comment_id: str) -> bool:
    global comments_db
    original_length = len(comments_db)
    comments_db = [c for c in comments_db if c.id != comment_id]
    return len(comments_db) < original_length


def get_comments_by_applicant_id(applicant_id: str, limit: int = MAX_COMMENTS) -> list[Comment]:
    return [c for c in comments_db if c.applicant_id == applicant_id][:limit]


def get_comment_by_id(comment_id: str) -> Optional[Comment]:
    for c in comments_db:
        if c.id == comment_id:
            return c
    return None
