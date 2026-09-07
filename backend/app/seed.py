from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.quotation import Product
from app.core.security import hash_password
from app.core.config import settings


def run_seed(db: Session):
    if not db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first():
        admin = User(
            name=settings.FIRST_ADMIN_NAME,
            email=settings.FIRST_ADMIN_EMAIL,
            hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
            role=UserRole.admin,
        )
        db.add(admin)

    if db.query(Product).count() == 0:
        sample_products = [
            Product(name="UPVC Panel 18mm", category="UPVC Panel", unit="Sq Ft",
                    purchase_cost=600, standard_selling_price=850, minimum_selling_price=750,
                    labour_cost=40, installation_cost=100, tax_percent=18, supplier="Default Supplier"),
            Product(name="UPVC Panel 12mm", category="UPVC Panel", unit="Sq Ft",
                    purchase_cost=450, standard_selling_price=700, minimum_selling_price=620,
                    labour_cost=30, installation_cost=100, tax_percent=18, supplier="Default Supplier"),
            Product(name="Soft-close Hinge", category="Hardware", unit="Piece",
                    purchase_cost=250, standard_selling_price=450, minimum_selling_price=380,
                    labour_cost=0, installation_cost=20, tax_percent=18, supplier="Default Supplier"),
            Product(name="Installation Labour", category="Service", unit="Sq Ft",
                    purchase_cost=100, standard_selling_price=180, minimum_selling_price=150,
                    labour_cost=0, installation_cost=0, tax_percent=0, supplier="In-house"),
        ]
        db.add_all(sample_products)

    db.commit()
