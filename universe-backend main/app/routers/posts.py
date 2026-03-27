from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Post, Comment, post_likes
from app.schemas import CreatePostRequest, CommentRequest, PostResponse, CommentResponse, MessageResponse
from app.auth.dependencies import get_current_user
from app.utils.files import save_upload_file

router = APIRouter(prefix="/posts", tags=["Social Feed"])


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: CreatePostRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new post."""
    post = Post(
        user_id=current_user.id,
        content=payload.content,
    )
    db.add(post)
    db.commit()
    post = db.query(Post).filter(Post.id == post.id).first()
    return PostResponse.from_orm_with_user(post, current_user.id)


@router.post("/{post_id}/image", response_model=PostResponse)
async def upload_post_image(
    post_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload image to a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if str(post.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your post")

    url = await save_upload_file(file, folder="posts")
    post.image_url = url
    db.commit()
    post = db.query(Post).filter(Post.id == post_id).first()
    return PostResponse.from_orm_with_user(post, current_user.id)


@router.get("", response_model=List[PostResponse])
def get_posts(
    search: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all posts (paginated), newest first."""
    query = db.query(Post)
    if search:
        query = query.filter(Post.content.ilike(f"%{search}%"))
    if user_id:
        query = query.filter(Post.user_id == user_id)

    posts = (
        query.order_by(Post.created_at.desc())
        .offset((page - 1) * pageSize)
        .limit(pageSize)
        .all()
    )
    return [PostResponse.from_orm_with_user(p, current_user.id) for p in posts]


@router.get("/{post_id}", response_model=PostResponse)
def get_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get single post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return PostResponse.from_orm_with_user(post, current_user.id)


@router.post("/{post_id}/like", response_model=PostResponse)
def like_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Like or unlike a post (toggle)."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    already_liked = any(str(u.id) == str(current_user.id) for u in post.liked_by)

    if already_liked:
        post.liked_by.remove(current_user)
        post.likes_count = max(0, post.likes_count - 1)
    else:
        post.liked_by.append(current_user)
        post.likes_count += 1

    db.commit()
    post = db.query(Post).filter(Post.id == post_id).first()
    return PostResponse.from_orm_with_user(post, current_user.id)


@router.post("/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    post_id: str,
    payload: CommentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add comment to a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=payload.content,
    )
    db.add(comment)
    post.comments_count += 1
    db.commit()
    db.refresh(comment)

    comment = db.query(Comment).filter(Comment.id == comment.id).first()
    return CommentResponse.from_orm(comment)


@router.get("/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(
    post_id: str,
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get comments for a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
        .offset((page - 1) * pageSize)
        .limit(pageSize)
        .all()
    )
    return [CommentResponse.from_orm(c) for c in comments]


@router.delete("/{post_id}", response_model=MessageResponse)
def delete_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete own post (or admin can delete any)."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    from app.models import UserRole
    if str(post.user_id) != str(current_user.id) and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    db.delete(post)
    db.commit()
    return MessageResponse(message="Post deleted")
