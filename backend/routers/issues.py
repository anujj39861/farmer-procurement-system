from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models.all_models import Issue, IssueMessage, AuditLog
from backend.schemas.all_schemas import IssueCreate, IssueMessageCreate, IssueResponse
from backend.ml.complaint_classifier import complaint_classifier

router = APIRouter(prefix="/api/issues", tags=["Issues"])

@router.post("", response_model=IssueResponse)
def raise_issue(issue_in: IssueCreate, farmer_id: int = 1, db: Session = Depends(get_db)):
    full_text = f"{issue_in.subject} {issue_in.description}"
    nlp_res = complaint_classifier.classify(full_text)

    issue = Issue(
        farmer_id=farmer_id,
        token_id=issue_in.token_id,
        centre_id=issue_in.centre_id,
        subject=issue_in.subject,
        description=issue_in.description,
        category=nlp_res["suggested_category"],
        priority=nlp_res["suggested_priority"],
        ai_suggested_category=nlp_res["suggested_category"],
        ai_suggested_priority=nlp_res["suggested_priority"],
        status="open"
    )
    db.add(issue)

    # Initial message
    msg = IssueMessage(
        issue=issue,
        sender_id=farmer_id,
        sender_role="farmer",
        message=issue_in.description
    )
    db.add(msg)

    # Audit log
    audit = AuditLog(
        actor_id=farmer_id,
        actor_role="farmer",
        entity_type="issue",
        entity_id="NEW",
        action="RAISE_ISSUE",
        new_value=f"Category:{nlp_res['suggested_category']}, Priority:{nlp_res['suggested_priority']}",
        reason=issue_in.subject
    )
    db.add(audit)

    db.commit()
    db.refresh(issue)
    return issue

@router.get("", response_model=List[IssueResponse])
def list_issues(farmer_id: int = None, status: str = None, db: Session = Depends(get_db)):
    query = db.query(Issue)
    if farmer_id:
        query = query.filter(Issue.farmer_id == farmer_id)
    if status:
        query = query.filter(Issue.status == status)
    return query.order_by(Issue.created_at.desc()).all()

@router.get("/{issue_id}", response_model=IssueResponse)
def get_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue

@router.post("/{issue_id}/messages")
def add_issue_message(issue_id: int, msg_in: IssueMessageCreate, sender_id: int = 1, sender_role: str = "farmer", db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    msg = IssueMessage(
        issue_id=issue_id,
        sender_id=sender_id,
        sender_role=sender_role,
        message=msg_in.message
    )
    db.add(msg)

    if sender_role in ["supervisor", "admin"]:
        issue.status = "investigating"

    db.commit()
    return {"message": "Reply posted successfully"}

@router.patch("/{issue_id}/status")
def update_issue_status(issue_id: int, status: str, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    issue.status = status
    db.commit()
    return {"message": f"Issue status updated to {status}"}
