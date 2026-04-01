"""
UniVerse Database Seeder — Updated with real data from Student_1.docx
Run: python scripts/seed.py
"""
import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from datetime import date, time, datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import (
    User, Announcement, Event, SubjectAttendance, DayAttendance,
    Post, Comment, Timetable, Job, Notification,
    UserRole, AnnouncementType, EventCategory, AttendanceStatus, JobStatus,
)
from app.auth.utils import hash_password

Base.metadata.create_all(bind=engine)
db: Session = SessionLocal()

# ─── Constants ────────────────────────────────────────────────────────────────

SUBJECTS = [
    "Soft Computing",
    "Data Science",
    "Software Project Management",
    "Cyber Security",
    "Data Warehousing and Data Mining",
]

TOTAL_PER_SUBJECT = 128 // len(SUBJECTS)   # 25 each; last gets remainder to hit 128

SLOT_1 = (time(9, 0),   time(10, 40))
SLOT_2 = (time(10, 40), time(12, 20))
SLOT_3 = (time(13, 20), time(15, 10))

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

# A week in March 2026 for day-wise attendance
MARCH_WEEK = [
    date(2026, 3, 16),  # Monday
    date(2026, 3, 17),  # Tuesday
    date(2026, 3, 18),  # Wednesday
    date(2026, 3, 19),  # Thursday
    date(2026, 3, 20),  # Friday
    date(2026, 3, 21),  # Saturday
]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def clear_data():
    print("   Clearing existing data...")
    for table in reversed(Base.metadata.sorted_tables):
        db.execute(table.delete())
    db.commit()


def _pick_status(pct: float) -> AttendanceStatus:
    """Return present/absent biased toward student's attendance percentage (3:1 ratio)."""
    threshold = max(0.75, pct / 100)
    return AttendanceStatus.present if random.random() < threshold else AttendanceStatus.absent


# ─── USERS ────────────────────────────────────────────────────────────────────

def seed_users():
    print("   Seeding users...")
    random.seed(42)

    users_data = [
        dict(name="Admin", email="admin@universe.edu", password="admin123",
             role=UserRole.admin, department="Administration"),

        dict(name="Yamini Swathi", email="yaminiswathi@andhrauniversity.edu.in", password="faculty123",
             role=UserRole.faculty, department="CSE", designation="Assistant Professor"),

        dict(name="Prof. V Valli Kumari", email="vallikumari@andhrauniversity.edu.in", password="faculty123",
             role=UserRole.faculty, department="CSE", designation="HOD"),

        dict(name="Sadasivuni Gyaneswari",      email="322506402359@andhrauniversity.edu.in", password="student123",
             role=UserRole.student, department="CSE", year=4, section="06",
             registration_number="322506402359", overall_attendance=87.0),

        dict(name="Sai Moksha Naimisha Namburu", email="322506402362@andhrauniversity.edu.in", password="student123",
             role=UserRole.student, department="CSE", year=4, section="06",
             registration_number="322506402362", overall_attendance=85.0),

        dict(name="Salapu Karthik",             email="322506402365@andhrauniversity.edu.in", password="student123",
             role=UserRole.student, department="CSE", year=4, section="06",
             registration_number="322506402365", overall_attendance=82.0),

        dict(name="Senapathi S Rahul",           email="322506402383@andhrauniversity.edu.in", password="student123",
             role=UserRole.student, department="CSE", year=4, section="06",
             registration_number="322506402383", overall_attendance=86.0),
    ]

    created = {}
    for d in users_data:
        u = User(
            name=d["name"], email=d["email"],
            hashed_password=hash_password(d["password"]),
            role=d["role"], department=d.get("department"),
            year=d.get("year"), section=d.get("section"),
            registration_number=d.get("registration_number"),
            overall_attendance=d.get("overall_attendance", 0.0),
            designation=d.get("designation"),
        )
        db.add(u)
        created[d["email"]] = u

    db.commit()
    for u in created.values():
        db.refresh(u)

    print(f"   OK  {len(created)} users")
    return created


# ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────

def seed_announcements(users):
    print("   Seeding announcements...")
    admin   = users["admin@universe.edu"]
    faculty = users["yaminiswathi@andhrauniversity.edu.in"]

    rows = [
        Announcement(
            title="AURA X Dept Day",
            body=(
                "Get ready to celebrate the Annual University AURA X Department Day! "
                "Join us for a day packed with technical exhibitions, cultural performances, "
                "inter-department competitions, and much more. All CSE students are encouraged "
                "to actively participate and showcase their talent. Stalls, games, and prizes await — "
                "don't miss out on the biggest departmental event of the year!"
            ),
            type=AnnouncementType.general, date=date(2026, 3, 23),
            is_urgent=False, created_by=admin.id,
        ),
        Announcement(
            title="AU Centenary Celebrations – Feast Fest",
            body=(
                "Andhra University's grand Centenary Celebrations continue with the Feast Fest — "
                "a vibrant food and cultural festival open to all students and staff. "
                "Enjoy cuisines from across the country, live music, cultural acts, and fun games. "
                "Come hungry, leave happy! Entry is free for all AU students with a valid ID card."
            ),
            type=AnnouncementType.general, date=date(2026, 3, 21),
            is_urgent=False, created_by=admin.id,
        ),
        Announcement(
            title="Holiday Notice – Ugadhi",
            body=(
                "The university will remain closed on 19th March 2026 on account of Ugadhi, "
                "the Telugu New Year. All classes, lab sessions, and administrative offices will be shut. "
                "Classes will resume as normal on 20th March 2026. Wish you all a very Happy Ugadhi!"
            ),
            type=AnnouncementType.holiday, date=date(2026, 3, 18),
            is_urgent=True, created_by=admin.id,
        ),
        Announcement(
            title="Holiday Notice – Ramzan",
            body=(
                "The university will remain closed on 21st March 2026 in observance of Ramzan (Eid-ul-Fitr). "
                "All academic and administrative activities are suspended for the day. "
                "Classes will resume on 23rd March 2026. Eid Mubarak to all celebrating!"
            ),
            type=AnnouncementType.holiday, date=date(2026, 3, 20),
            is_urgent=True, created_by=admin.id,
        ),
    ]

    for a in rows:
        db.add(a)
    db.commit()
    print(f"   OK  {len(rows)} announcements")


# ─── EVENTS ───────────────────────────────────────────────────────────────────

def seed_events(users):
    print("   Seeding events...")
    admin   = users["admin@universe.edu"]
    faculty = users["yaminiswathi@andhrauniversity.edu.in"]

    rows = [
        Event(title="AURA X – Tug of War (Men's)",
              description="Battle of strength at AURA X Dept Day! Form your team of 8 and pull your way to glory. Register at the sports desk before 23rd March. Winners get trophies and bragging rights for the whole year!",
              date=date(2026, 3, 23), time=time(10, 0), venue="University Grounds",
              category=EventCategory.sports, total_slots=80, registered_count=32, created_by=admin.id),

        Event(title="AURA X – Dance Competition",
              description="Shake a leg at AURA X Dept Day! Solo, duet, and group categories. Classical, folk, western — all forms welcome. Register via the Google Form shared by your CR. Prizes worth Rs.5,000 across categories.",
              date=date(2026, 3, 23), time=time(14, 0), venue="Open Air Theatre",
              category=EventCategory.cultural, total_slots=50, registered_count=18, created_by=faculty.id),

        Event(title="HackCSE – 12-Hour Mini Hackathon",
              description="12-hour internal hackathon for CSE 4th year students. Build solutions around AI/ML, Cybersecurity, or Data Science. Teams of 3-4. Problem statements released 30 minutes before. Cloud credits and internship referrals for top 3!",
              date=date(2026, 4, 5), time=time(9, 0), venue="Computer Lab Block – Floor 3",
              category=EventCategory.technical, total_slots=60, registered_count=24, created_by=faculty.id),

        Event(title="Cyber Security Awareness Workshop",
              description="Industry-led hands-on workshop covering ethical hacking basics, network penetration testing, and real-world case studies. Conducted by certified professionals. Completion certificate issued. Highly relevant for placements!",
              date=date(2026, 4, 12), time=time(10, 0), venue="Seminar Hall 2",
              category=EventCategory.technical, total_slots=100, registered_count=67, created_by=faculty.id),

        Event(title="AU Centenary Feast Fest",
              description="Celebrate 100 years of Andhra University with an amazing Feast Fest! Food stalls, cultural shows, games, and giveaways. Free entry with ID card. Don't miss the food court and live band performance!",
              date=date(2026, 3, 21), time=time(11, 0), venue="Main Campus Grounds",
              category=EventCategory.cultural, total_slots=500, registered_count=278, created_by=admin.id),
    ]

    for e in rows:
        db.add(e)
    db.commit()
    print(f"   OK  {len(rows)} events")


# ─── ATTENDANCE ───────────────────────────────────────────────────────────────

def seed_attendance(users):
    print("   Seeding attendance (128 classes, 5 subjects, 3:1 ratio)...")
    faculty = users["yaminiswathi@andhrauniversity.edu.in"]

    students = [
        (users["322506402359@andhrauniversity.edu.in"], 87.0),
        (users["322506402362@andhrauniversity.edu.in"], 85.0),
        (users["322506402365@andhrauniversity.edu.in"], 82.0),
        (users["322506402383@andhrauniversity.edu.in"], 86.0),
    ]

    random.seed(42)

    for student, pct in students:
        total_all = 0
        attended_all = 0

        for i, subject in enumerate(SUBJECTS):
            # last subject gets the remainder so total hits 128
            total = TOTAL_PER_SUBJECT + (128 - TOTAL_PER_SUBJECT * len(SUBJECTS) if i == len(SUBJECTS) - 1 else 0)
            attended = 0

            for class_num in range(total):
                day = MARCH_WEEK[class_num % len(MARCH_WEEK)]
                status = _pick_status(pct)
                if status == AttendanceStatus.present:
                    attended += 1

                db.add(DayAttendance(
                    registration_number=student.registration_number,
                    date=day,
                    subject=subject,
                    status=status,
                    marked_by=faculty.id,
                ))

            pct_subj = round((attended / total * 100), 2) if total > 0 else 0.0
            db.add(SubjectAttendance(
                registration_number=student.registration_number,
                subject=subject,
                total_classes=total,
                attended_classes=attended,
                percentage=pct_subj,
            ))
            total_all += total
            attended_all += attended

        student.overall_attendance = round((attended_all / total_all * 100), 2) if total_all > 0 else 0.0

    db.commit()
    print("   OK  attendance records")


# ─── TIMETABLE ────────────────────────────────────────────────────────────────

def seed_timetable(users):
    print("   Seeding timetable (Mon–Sat, 3 slots + labs)...")
    f1 = users["yaminiswathi@andhrauniversity.edu.in"]     # Yamini Swathi
    f2 = users["vallikumari@andhrauniversity.edu.in"]      # Prof. V Valli Kumari

    def entry(day, subject, slot, faculty, room):
        return Timetable(
            day=day, subject=subject,
            start_time=slot[0], end_time=slot[1],
            faculty_id=faculty.id, room=room,
            department="CSE", section="06", year=4,
        )

    rows = [
        # Monday
        entry("Monday", "Soft Computing",                    SLOT_1, f1, "CSE-301"),
        entry("Monday", "Data Science",                      SLOT_2, f2, "CSE-302"),
        entry("Monday", "Cyber Security",                    SLOT_3, f1, "CSE-301"),
        # Tuesday
        entry("Tuesday", "Data Warehousing and Data Mining", SLOT_1, f2, "CSE-302"),
        entry("Tuesday", "Software Project Management",      SLOT_2, f1, "CSE-303"),
        entry("Tuesday", "COA Lab",                          SLOT_3, f1, "Hardware Lab"),
        # Wednesday
        entry("Wednesday", "Soft Computing",                 SLOT_1, f1, "CSE-301"),
        entry("Wednesday", "Cyber Security",                 SLOT_2, f1, "CSE-301"),
        entry("Wednesday", "Data Science",                   SLOT_3, f2, "CSE-302"),
        # Thursday
        entry("Thursday", "Software Project Management",     SLOT_1, f1, "CSE-303"),
        entry("Thursday", "Data Warehousing and Data Mining",SLOT_2, f2, "CSE-302"),
        entry("Thursday", "DTPI Lab",                        SLOT_3, f2, "DTPI Lab"),
        # Friday
        entry("Friday", "Data Science",                      SLOT_1, f2, "CSE-302"),
        entry("Friday", "Soft Computing",                    SLOT_2, f1, "CSE-301"),
        entry("Friday", "Cyber Security",                    SLOT_3, f1, "CSE-301"),
        # Saturday
        entry("Saturday", "Software Project Management",     SLOT_1, f1, "CSE-303"),
        entry("Saturday", "Data Warehousing and Data Mining",SLOT_2, f2, "CSE-302"),
    ]

    for e in rows:
        db.add(e)
    db.commit()
    print(f"   OK  {len(rows)} timetable entries")


# ─── POSTS / SOCIAL FEED ──────────────────────────────────────────────────────

def seed_posts(users):
    print("   Seeding posts & comments...")

    ashi    = users["322506402359@andhrauniversity.edu.in"]   # Gyaneswari → "Ashi_12"
    diya    = users["322506402362@andhrauniversity.edu.in"]   # Sai Moksha → "diya_200"
    karthik = users["322506402365@andhrauniversity.edu.in"]
    rahul   = users["322506402383@andhrauniversity.edu.in"]
    faculty = users["yaminiswathi@andhrauniversity.edu.in"]

    def add_post(user, content, likes, comments_count, created_at):
        p = Post(user_id=user.id, content=content, likes_count=likes,
                 comments_count=comments_count, created_at=created_at)
        db.add(p)
        db.flush()
        return p

    def add_comment(post, user, content, created_at):
        db.add(Comment(post_id=post.id, user_id=user.id,
                       content=content, created_at=created_at))

    # Post 1 – Tug of War (from doc: Ashi_12, 17:02)
    p1 = add_post(ashi,
        "anyone interested in participating for the tug of war mens in the AURA X events.\npls comment 💪",
        20, 7, datetime(2026, 3, 22, 17, 2))
    add_comment(p1, diya,    "I am interested!",                              datetime(2026, 3, 22, 17, 10))
    add_comment(p1, karthik, "me",                                            datetime(2026, 3, 22, 17, 15))
    add_comment(p1, rahul,   "I guess all should be from same class right",   datetime(2026, 3, 22, 17, 20))
    add_comment(p1, ashi,    "yes same section preferred!",                   datetime(2026, 3, 22, 17, 25))
    add_comment(p1, karthik, "count me in 🙋",                               datetime(2026, 3, 22, 17, 30))
    add_comment(p1, rahul,   "let's go team!",                               datetime(2026, 3, 22, 17, 35))
    add_comment(p1, diya,    "I'll ask the others too",                       datetime(2026, 3, 22, 17, 40))

    # Post 2 – Dance registrations (from doc: diya_200, 9:00)
    add_post(diya,
        "Aura x dept day dance registrations are open 🎉\npls fill the google form to join if interested 💃🕺",
        5, 0, datetime(2026, 3, 21, 9, 0))

    # Post 3 – Faculty assignment reminder
    p3 = add_post(faculty,
        "📢 Reminder: Cyber Security assignment (Unit 3 – Network Security Protocols) "
        "submission deadline is this Friday. Upload via the university portal with your "
        "registration number as the filename. No late submissions accepted.",
        14, 3, datetime(2026, 3, 20, 11, 0))
    add_comment(p3, ashi,    "Noted ma'am 🙏",              datetime(2026, 3, 20, 11, 30))
    add_comment(p3, karthik, "Is it individual or team?",    datetime(2026, 3, 20, 11, 45))
    add_comment(p3, faculty, "Individual submission only.",   datetime(2026, 3, 20, 12, 0))

    # Post 4 – Data Science project
    p4 = add_post(rahul,
        "Just finished our Data Science mini-project on traffic congestion prediction 🚦📊 "
        "Used Random Forest + real Vizag city data. Results were way better than expected. "
        "Presenting next week in class — wish us luck! 🤞",
        31, 4, datetime(2026, 3, 19, 16, 30))
    add_comment(p4, ashi,    "That sounds amazing! 🔥",              datetime(2026, 3, 19, 17, 0))
    add_comment(p4, diya,    "Random Forest on real data? Respect.",  datetime(2026, 3, 19, 17, 10))
    add_comment(p4, karthik, "All the best! 💪",                     datetime(2026, 3, 19, 17, 20))
    add_comment(p4, rahul,   "Thanks everyone 🙏",                   datetime(2026, 3, 19, 17, 30))

    # Post 5 – AURA X hype
    p5 = add_post(karthik,
        "AURA X Dept Day is tomorrow! 🎊\n"
        "• Tug of War at 10:00 AM – University Grounds\n"
        "• Dance Competition at 2:00 PM – Open Air Theatre\n"
        "• Food stalls open all day 🍕\n"
        "See y'all there! 🚀",
        47, 2, datetime(2026, 3, 22, 8, 0))
    add_comment(p5, diya,  "Can't wait!! 🥳",           datetime(2026, 3, 22, 8, 30))
    add_comment(p5, rahul, "Tug of war gang assemble!",  datetime(2026, 3, 22, 8, 45))

    db.commit()
    print("   OK  5 posts + comments")


# ─── JOBS ─────────────────────────────────────────────────────────────────────

def seed_jobs(users):
    print("   Seeding career/placements...")
    admin = users["admin@universe.edu"]

    rows = [
        Job(company_name="TCS", role="Software Engineer – Digital", package="₹7 LPA",
            deadline=date(2026, 4, 10), status=JobStatus.open, created_by=admin.id,
            description="TCS is hiring 4th year B.Tech/M.Tech CSE students. Online aptitude + coding test followed by technical and HR rounds. Min CGPA 6.0. Bond of 2 years applicable."),
        Job(company_name="Infosys", role="Systems Engineer", package="₹6.5 LPA",
            deadline=date(2026, 4, 15), status=JobStatus.open, created_by=admin.id,
            description="On-campus drive for Infosys Systems Engineer. Open to all CSE branches. Aptitude, verbal reasoning, and coding test. Training at Mysuru campus post-selection."),
        Job(company_name="Wipro", role="Project Engineer", package="₹6.5 LPA",
            deadline=date(2026, 4, 20), status=JobStatus.open, created_by=admin.id,
            description="Wipro Elite NLTH drive for final year students. Online test + technical interview. Eligible branches: CSE, IT, ECE. CGPA >= 6.5. Joining: July 2026."),
        Job(company_name="Amazon", role="SDE Intern → Full-time", package="₹50,000/month (Intern) | ₹24 LPA (FTE)",
            deadline=date(2026, 4, 5), status=JobStatus.open, created_by=admin.id,
            description="Amazon India internship-to-full-time conversion program. 6-month internship at Hyderabad/Bangalore. Strong DSA, OS, and system design required. Min CGPA 8.0."),
    ]

    for j in rows:
        db.add(j)
    db.commit()
    print(f"   OK  {len(rows)} job listings")


# ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

def seed_notifications(users):
    print("   Seeding notifications...")

    s = [
        users["322506402359@andhrauniversity.edu.in"],  # Gyaneswari
        users["322506402362@andhrauniversity.edu.in"],  # Sai Moksha
        users["322506402365@andhrauniversity.edu.in"],  # Karthik
        users["322506402383@andhrauniversity.edu.in"],  # Rahul
    ]

    rows = [
        Notification(user_id=s[0].id, title="Attendance Alert – Cyber Security",
                     message="Your attendance in Cyber Security has dropped below 80%. Please attend regularly.", is_read=False),
        Notification(user_id=s[0].id, title="AURA X Tug of War Registration",
                     message="You have been added to the Tug of War team. Report at University Grounds by 9:30 AM.", is_read=True),
        Notification(user_id=s[0].id, title="Assignment Due – Data Science",
                     message="Data Science Unit 4 assignment deadline is tomorrow. Submit on the portal.", is_read=False),

        Notification(user_id=s[1].id, title="Dance Registration Confirmed",
                     message="Your dance competition registration for AURA X is confirmed. Report at Open Air Theatre by 1:30 PM.", is_read=True),
        Notification(user_id=s[1].id, title="Exam Schedule – May 2026",
                     message="End-semester exam schedule for May 2026 has been published. Check Announcements.", is_read=False),

        Notification(user_id=s[2].id, title="Attendance Alert – Data Warehousing",
                     message="Your attendance in Data Warehousing and Data Mining is at 74%. Minimum required is 75%.", is_read=False),
        Notification(user_id=s[2].id, title="HackCSE Registration Open",
                     message="Registrations for HackCSE 12-hour hackathon are now open. Register before 1st April.", is_read=False),

        Notification(user_id=s[3].id, title="TCS Drive – Shortlisted",
                     message="Congratulations! You have been shortlisted for the TCS aptitude test on 10th April.", is_read=False),
        Notification(user_id=s[3].id, title="Project Presentation – 25th March",
                     message="Your Data Science project presentation is scheduled for 25th March at 10:00 AM in CSE-302.", is_read=True),
    ]

    for n in rows:
        db.add(n)
    db.commit()
    print(f"   OK  {len(rows)} notifications")


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    print("\n UniVerse Database Seeder")
    print("=" * 52)
    clear_data()
    users = seed_users()
    seed_announcements(users)
    seed_events(users)
    seed_attendance(users)
    seed_timetable(users)
    seed_posts(users)
    seed_jobs(users)
    seed_notifications(users)
    db.close()

    print("\n" + "=" * 52)
    print("Database seeded!\n")
    print("Login credentials")
    print("-" * 52)
    print("  ADMIN")
    print("    admin@universe.edu            admin123\n")
    print("  FACULTY  (password: faculty123)")
    print("    yaminiswathi@andhrauniversity.edu.in        Yamini Swathi (Asst. Prof)")
    print("    vallikumari@andhrauniversity.edu.in         Prof. V Valli Kumari (HOD)\n")
    print("  STUDENTS  (password: student123)")
    print("    322506402359@andhrauniversity.edu.in        Sadasivuni Gyaneswari")
    print("    322506402362@andhrauniversity.edu.in        Sai Moksha Naimisha Namburu")
    print("    322506402365@andhrauniversity.edu.in        Salapu Karthik")
    print("    322506402383@andhrauniversity.edu.in        Senapathi S Rahul")
    print("\n  uvicorn app.main:app --reload")
    print("  http://localhost:8000/docs\n")


if __name__ == "__main__":
    main()